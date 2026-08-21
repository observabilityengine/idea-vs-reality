# idea-vs-reality

## Product

Idea vs Reality is a consumer memory/reminder application designed for mass production and public distribution.

> The app remembers what I need to remember so I don't have to.

The core experience is a simple list. A user can immediately speak or type something they need to remember. When a memory is completed by swipe, it disappears from the active list but remains in local completion history.

The repository is authorized for this product only.

## Production repository tree

The following is the planned production repository structure. The purpose of every application-controlled file is documented directly in the tree.

```text
idea-vs-reality/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│           Purpose: Automatically type-check and test every change.
│
├── assets/
│   ├── icon.png
│   │   Purpose: The Head Check app icon displayed on the device.
│   │
│   └── splash-icon.png
│       Purpose: Minimal launch asset shown while the app starts.
│
├── src/
│   │
│   ├── components/
│   │   ├── AddMemory.tsx
│   │   │   Purpose: Accepts a memory by typing or speaking and submits it.
│   │   │
│   │   ├── MemoryItem.tsx
│   │   │   Purpose: Displays one memory and handles swipe-to-complete.
│   │   │
│   │   └── MemoryList.tsx
│   │       Purpose: Displays the user's active memories in their computed order.
│   │
│   ├── db/
│   │   ├── database.ts
│   │   │   Purpose: Reads and writes memories and completion history in SQLite.
│   │   │
│   │   └── migrations.ts
│   │       Purpose: Creates and safely upgrades the local database schema.
│   │
│   ├── domain/
│   │   ├── memory.ts
│   │   │   Purpose: Defines the canonical memory data structure and rules.
│   │   │
│   │   ├── parser.ts
│   │   │   Purpose: Interprets captured language into memory text and hidden metadata.
│   │   │
│   │   └── ordering.ts
│   │       Purpose: Determines the quiet internal order of active memories.
│   │
│   ├── services/
│   │   └── speech.ts
│   │       Purpose: Provides the native speech-recognition interface to the app.
│   │
│   ├── theme/
│   │   └── theme.ts
│   │       Purpose: Defines the application's minimal visual design constants.
│   │
│   └── App.tsx
│       Purpose: Connects the application pieces and provides the main screen.
│
├── tests/
│   ├── database.test.ts
│   │   Purpose: Verifies persistence, completion, history, and database behavior.
│   │
│   ├── parser.test.ts
│   │   Purpose: Verifies dates, times, appointments, and internal instructions.
│   │
│   └── ordering.test.ts
│       Purpose: Verifies appointment, important, and ordinary-memory ordering.
│
├── app.json
│   Purpose: Configures the native iOS and Android application.
│
├── eas.json
│   Purpose: Defines the development, testing, and production build configuration.
│
├── package.json
│   Purpose: Defines the application dependencies and development commands.
│
├── package-lock.json
│   Purpose: Locks the exact dependency tree used to build and test the application.
│
├── tsconfig.json
│   Purpose: Defines the TypeScript compiler rules for the project.
│
├── .gitignore
│   Purpose: Prevents generated files, secrets, and build artifacts from entering Git.
│
└── README.md
    Purpose: Documents the product requirements, architecture, development process,
             testing requirements, and production constraints.
```

The tree is a build plan. Files will be implemented and verified in dependency order rather than created with unverified placeholder code.

## Architecture

This is a real mobile application, not a web prototype.

- React Native + Expo for iOS and Android.
- TypeScript for compile-time safety.
- SQLite through `expo-sqlite` for durable local storage.
- Native speech recognition through a compatible Expo speech-recognition package.
- Native gesture handling for swipe-to-complete.
- Deterministic rule-based parsing and ordering for the core product.
- EAS Build for reproducible distribution builds.

Exact dependency versions must be selected as a mutually compatible set and locked in `package-lock.json`. No dependency version is treated as verified merely because it appears in a proposed architecture.

## Build order

The implementation is intentionally file-by-file:

1. `package.json`
2. `package-lock.json`
3. `tsconfig.json`
4. `app.json`
5. `eas.json`
6. `src/domain/memory.ts`
7. `src/db/migrations.ts`
8. `src/db/database.ts`
9. `tests/database.test.ts`
10. `src/domain/parser.ts`
11. `tests/parser.test.ts`
12. `src/domain/ordering.ts`
13. `tests/ordering.test.ts`
14. `src/services/speech.ts`
15. `src/theme/theme.ts`
16. `src/components/AddMemory.tsx`
17. `src/components/MemoryItem.tsx`
18. `src/components/MemoryList.tsx`
19. `src/App.tsx`
20. `.github/workflows/ci.yml`
21. `assets/icon.png`
22. `assets/splash-icon.png`

Each file must be checked against the actual repository and validated before proceeding to the next file.

## Core behavior

### Active memories

An active memory remains in the list until the user completes it.

If it is not completed, it appears again on subsequent days. The app does not tell the user that it was carried forward.

### Completion history

Completion is not deletion.

When the user swipes an item:

1. The completed state and completion timestamp are stored.
2. The item is removed from the active list.
3. The completed record remains locally available for later lookup.
4. It is not displayed in the primary list.
5. Automatic deletion must not occur until a retention period is explicitly defined.

The retention period has not yet been specified. The implementation must not invent one.

### Appointments

Appointments use hidden internal date/time metadata. The user never sees a calendar.

Example:

- June 11: `Doctor's appointment tomorrow`
- June 12: `Doctor's appointment, 1 PM`

Appointments appear at the top of the active list. Once completed, they disappear from the active list and remain in completion history.

### Important

If a user says `Important — call Toby's Eats`, `important` is an instruction to the application only.

The active list shows:

`Call Toby's Eats`

The word `important` must never appear in the user-facing memory text.

### Intelligent ordering

The ordering system is an internal memory aid, not a schedule the user must obey.

Examples:

- `Make my bed.` → naturally early.
- `Make dinner.` → naturally later.
- `Walk Doji.` → sensible inferred position.
- `Do my taxes.` → sensible position based on available evidence.

If there is insufficient evidence to infer an order, the system must use a deterministic stable fallback rather than invent precision.

## User interface requirements

The primary experience is the list.

- Large, readable text.
- Soft, low-contrast background.
- Generous spacing.
- No numbering.
- No bullets.
- No checkboxes.
- No checkmarks.
- No categories.
- No visible calendar.
- No unnecessary scheduling information.
- No motivational language.
- No AI explanations.
- No unfinished-task language.
- No carried-forward language.
- No guilt.
- No productivity statistics.
- No gamification.

The complicated reasoning belongs underneath the interface.

## Explicit non-goals

Do not add accounts, subscriptions, analytics, social features, monetization, onboarding, visible calendar UI, task statistics, gamification, AI explanations, nighttime list clearing, or backend/cloud storage for the core product unless those requirements are explicitly added later.

## Local-first data model

The initial product stores memories, hidden scheduling metadata, and completion history locally on the user's device. No account or server is required for the core experience.

Local storage must not be described as encrypted unless encryption is actually implemented and verified.

## Production verification

Before public distribution, physical iOS and Android testing is required for:

- text capture;
- voice capture;
- speech/microphone permission denial;
- swipe completion;
- persistence after app termination and restart;
- appointment parsing;
- time-zone and daylight-saving transitions;
- important-memory handling;
- carry-forward behavior;
- completion-history retention;
- database migrations;
- empty-list behavior;
- long lists;
- accessibility text sizing and touch targets;
- interrupted speech recognition;
- offline operation of core memory functions.

Compilation alone is not evidence of production correctness. Native behavior must be verified on both platforms.
