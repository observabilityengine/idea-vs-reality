# idea-vs-reality

## Product

Idea-vs-reality is a private personal memory/reminder application built around one core interaction:

> The app remembers what I need to remember so I don't have to.

The primary experience is a single list. The user can immediately speak or type a memory, and completed memories disappear from the active list.

This repository is authorized for this product only.

## Architecture decision

This is a **real mobile application**, not a web prototype.

- **React Native + Expo** for iOS and Android from one codebase.
- **TypeScript** for compile-time safety across persistence, dates, parsing, ordering, and native integrations.
- **SQLite via `expo-sqlite`** for durable on-device storage. SQLite is appropriate because active memories, completion history, and hidden date/time metadata are relational data and must survive app restarts. Expo documents that `expo-sqlite` persists the database across restarts. citeturn0search0
- **Native speech recognition** through `expo-speech-recognition`, rather than the deprecated `@react-native-voice/voice`. The latter repository is archived and explicitly directs users to `expo-speech-recognition`. citeturn2search1turn2search6
- **Native gesture handling** for swipe-to-complete.
- **Rule-based parsing and ordering**, not an AI service. The product must remain deterministic, private, fast, and understandable in code.
- **EAS Build** for reproducible iOS and Android distribution builds. Expo documents EAS Build as the service for producing standalone binaries for app-store distribution. citeturn1search1turn1search3

The current Expo SDK/package versions will be selected as a compatible set during implementation and locked in `package-lock.json`. We will not invent version combinations. The speech-recognition dependency must be validated against the selected Expo SDK in CI and on physical iOS and Android devices before release.

## Repository tree

The earlier React/Vite tree is rejected. It was appropriate for a web prototype, not for the production mobile application now specified.

The production tree is:

```text
idea-vs-reality/
├── .github/
│   └── workflows/
│       └── ci.yml
├── assets/
│   ├── icon.png
│   └── splash-icon.png
├── src/
│   ├── components/
│   │   ├── AddMemory.tsx
│   │   ├── MemoryItem.tsx
│   │   └── MemoryList.tsx
│   ├── db/
│   │   ├── database.ts
│   │   └── migrations.ts
│   ├── domain/
│   │   ├── memory.ts
│   │   ├── ordering.ts
│   │   └── parser.ts
│   ├── services/
│   │   └── speech.ts
│   ├── theme/
│   │   └── theme.ts
│   └── App.tsx
├── .gitignore
├── README.md
├── app.json
├── eas.json
├── package-lock.json
├── package.json
└── tsconfig.json
```

## File responsibilities

### `App.tsx`

The application root and screen composition. It owns the active-list lifecycle and connects UI actions to the persistence layer.

There is intentionally one primary screen. No routing library is required for the core product because the product does not require multiple user-facing destinations.

### `components/AddMemory.tsx`

Immediate text and voice capture.

Responsibilities:

- Accept typed memory text.
- Start/stop speech recognition.
- Submit the resulting text to the parser.
- Add the memory without an intermediate confirmation screen.

### `components/MemoryList.tsx`

Renders the active memories in their computed order.

Responsibilities:

- Load active memories.
- Refresh after creation/completion.
- Keep appointments at the top.
- Render only user-facing memory text and useful appointment time information.

### `components/MemoryItem.tsx`

One active memory and its swipe interaction.

Responsibilities:

- Display large readable text.
- Provide the swipe-to-complete gesture.
- On completion, atomically move the memory into completion history and remove it from the active set.

No checkbox, bullet, numbering, completion label, guilt language, or task-management decoration belongs here.

### `db/database.ts`

All SQLite reads and writes.

The database must contain at least the information needed to distinguish:

- active memories;
- completed memories;
- completion timestamps;
- appointment date/time metadata;
- internal importance state;
- inferred ordering metadata;
- retention information for completed-history cleanup.

All user-controlled values must be passed as SQLite parameters/prepared statements rather than concatenated into SQL. Expo explicitly documents parameterized statements as the protection against SQL injection. citeturn0search0

### `db/migrations.ts`

Versioned database schema migrations.

Production data must never depend on deleting and recreating the database when the schema changes.

### `domain/memory.ts`

Canonical TypeScript types and domain rules for memories.

The active/completed state belongs in the data model even though completion status is not exposed as a task-management concept in the UI.

### `domain/parser.ts`

Converts natural user input into structured internal metadata without changing the user's intended visible text unnecessarily.

Examples:

- `Important — call Toby's Eats` → visible text `Call Toby's Eats`, internal importance flag set.
- `Doctor's appointment June 12th at 1 PM` → appointment metadata containing the parsed local date/time.
- Ordinary text without a recognized date/time remains an ordinary memory.

Natural-language date parsing should use a tested parser rather than a collection of fragile regular expressions. Chrono is specifically designed to extract dates and times from natural language such as “tomorrow”, named dates, and clock times. citeturn4search3

The parser must never invent a date or time. If a date/time cannot be established confidently, the memory remains an ordinary memory rather than receiving fabricated scheduling metadata.

### `domain/ordering.ts`

Deterministic ordering logic.

Required ordering principles:

1. Appointments first.
2. Explicitly important memories next.
3. Ordinary memories ordered using conservative task-time heuristics.
4. When there is insufficient information, preserve stable insertion order rather than pretending to know the user's schedule.

The ordering is a memory aid, not a user-visible schedule.

### `services/speech.ts`

A narrow adapter around native speech recognition.

Keeping native speech code behind one interface prevents the UI and domain logic from depending directly on the native module and makes device/platform testing possible.

The selected speech-recognition package requires native configuration; Expo's documentation for the package states that a development build is required rather than Expo Go. citeturn2search3

### `theme/theme.ts`

Central visual constants for the intentionally minimal interface.

No CSS framework is required. React Native styles are sufficient for this UI.

### `app.json`

Expo application configuration, including the app name, bundle identifiers, permissions, native plugins, icon, splash configuration, and platform settings.

The Head Check icon is the actual application icon shown on the device home screen. Expo documents the `icon` configuration and recommends a square 1024×1024 PNG for the app icon. citeturn1search2turn1search4

### `eas.json`

Build profiles for development, internal testing, and production distribution. Expo documents development, preview/internal, and production build profiles as the normal EAS configuration. citeturn1search0

### `package.json`

Runtime and development dependencies plus reproducible scripts for type checking, tests, linting if adopted, and builds.

### `package-lock.json`

Locks the exact dependency graph used for reproducible installs and CI builds.

### `tsconfig.json`

TypeScript compiler configuration.

### `.github/workflows/ci.yml`

Continuous integration checks. At minimum, CI must install from the lockfile, type-check, run automated tests, and verify that the project can be validated by Expo tooling.

### `assets/icon.png`

Production application icon. It must be a real 1024×1024 PNG asset; it is not generated by application code. Expo uses the configured icon asset to generate platform-specific icon sizes during builds. citeturn1search2

### `assets/splash-icon.png`

Minimal launch asset. It must not become a second onboarding or marketing screen.

## Data behavior

### Active memories

An active memory is shown in the main list until the user completes it.

If it is not completed, it remains available and appears again on subsequent days. There is no “carried forward” state exposed to the user.

### Completion history

Completion is not deletion.

When the user swipes a memory to complete it:

1. The memory is recorded as completed with a completion timestamp.
2. The memory is removed from the active query immediately.
3. The completed record remains in local SQLite history.
4. The history is not shown on the primary screen.
5. A retention policy may remove old completed records later.

The retention duration is deliberately not hard-coded in the product specification yet. It must be defined before implementing automatic history deletion. Until that decision is made, completed records must not be silently discarded.

### Appointments

Appointments are internal date/time metadata, not a visible calendar.

Examples:

- The day before: `Doctor's appointment tomorrow`
- Appointment day: `Doctor's appointment, 1 PM`

Appointments sort above ordinary memories. After completion they disappear from the active list but remain in completion history.

### Importance

`important` is an instruction, not display text.

`Important — call Toby's Eats` is stored with an internal importance flag while the visible memory remains `Call Toby's Eats`.

## User interface constraints

The main screen must remain:

- one simple list;
- large readable text;
- soft, low-contrast background;
- generous spacing;
- no numbering;
- no bullets;
- no checkboxes;
- no checkmarks;
- no categories;
- no visible calendar;
- no visible scheduling controls;
- no motivational language;
- no AI explanations;
- no productivity statistics;
- no gamification;
- no guilt language.

The complexity belongs in the data model and domain logic, not in the interface.

## Explicit non-goals

The initial production codebase will not include:

- accounts;
- subscriptions;
- analytics;
- social features;
- monetization;
- onboarding;
- public product infrastructure;
- a visible calendar;
- task statistics;
- gamification;
- AI explanations;
- a nighttime list-clearing feature;
- a backend or cloud database.

## Privacy model

The initial application is local-first.

Memory text, completion history, and hidden scheduling metadata are stored on the device. No account or server is required for the core experience.

This is an architectural requirement, not a claim that the app is automatically secure against every device-level threat. If stronger at-rest protection becomes a requirement, the storage design must be changed deliberately and tested on both platforms.

## Production quality requirements

Before public distribution, the application must be tested on physical iOS and Android devices for at least:

- text capture;
- voice capture and permission denial;
- swipe completion;
- persistence across process termination and restart;
- date parsing across time zones and daylight-saving transitions;
- appointment ordering;
- important-memory handling;
- carry-forward behavior;
- completion-history retention;
- database migrations;
- empty-list behavior;
- long lists;
- accessibility text sizing and touch targets;
- interrupted speech recognition;
- offline operation of all core memory functions.

No feature is considered production-ready because it merely compiles. Native behavior must be verified on both supported platforms.

## Current repository state

At the start of this architecture review, the repository contained only `README.md` and `.gitignore`; there was no existing application implementation to preserve. The original README described an unrelated startup-idea reality-check tool and has been replaced with this product specification. 
