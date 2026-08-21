# Build note

Input hardening is implemented on the build/input-hardening branch.

- Memory text is normalized before persistence.
- Empty and oversized memory values are rejected.
- Text and speech capture are capped at 500 characters.
- Validation is covered by tests.
