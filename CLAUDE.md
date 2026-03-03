# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reamot is a React Native mobile app (iOS & Android) for medication adherence. Patients track their medications, set reminders, and grant access to their doctors/pharmacists. The backend is entirely Firebase (Auth, Firestore, Storage, ML Vision).

## IMPORTANT: Docs-First Rule

**Before generating any code, always check the `/docs` directory for a relevant documentation file and follow the guidelines within it.** If a docs file exists that covers the area you are working in (e.g. `docs/ui.md` for UI components, `docs/db.md` for database work), you MUST read and adhere to it before writing any code:

- /docs/roadmap.md

## Commands

```bash
# Start Metro bundler
npm start

# Run on Android
npm run run:android

# Run on iOS (iPhone X simulator)
npm run run:ios

# Run tests (pnpm is the package manager)
npm test

# Run only screen tests
npx jest --testPathPattern="__tests__/screens"

# Build Android release APK
npm run build:apk

# Lint
npx eslint .
```

## Architecture

### Navigation Structure

The app uses **react-navigation v7** with a layered navigator pattern:

```
SwitchNavigator (App.js)
├── Loading        → checks Firebase auth state, redirects to App/AuthStack/Verify
├── AuthStack      → Login, Register, ForgotPassword, Terms
├── App (Drawer)   → right-side drawer wrapping BottomTabs
│   └── BottomTabs (5 tabs)
│       ├── Home      → HomeStack
│       ├── Calendar  → CalendarStack
│       ├── Medicine  → MedicineStack
│       ├── Doctor    → DoctorStack
│       └── Profile   → opens drawer (MoreStack content)
└── Verify         → email verification screen
```

Routes are defined in `src/routes/`. Each tab corresponds to a Stack navigator in its own file. The drawer navigator wraps BottomTabs and opens from the right.

`NavigationService` (`src/utilities/NavigationService.js`) provides imperative navigation for use outside components (e.g., from alarm notification handlers).

### Firebase Collections (Firestore)

- **users** – patient profiles; contains `doctorList` and `pharmacistList` arrays of emails
- **medicine** – global medicine catalog (name, image, description, barcode)
- **prescription** – medicines assigned to a patient (`patientEmail`, `name`, `adder: 'patient'|'doctor'`)
- **reminder** – scheduled alarms per patient (`patientEmail`, `medicine`, `time`, `idAN`, `alarmId`)
- **history** – medication intake records (`patientEmail`, `medicine`, `date`, `status: 'taken'|'missed'`, `startTime`)
- **doctor** / **pharmacist** – professional profiles with `doctorEmail`/`pharmacistEmail`

### Tech Stack

- **React Native 0.76.9**, class components throughout (no hooks)
- **Firebase v23** — Auth, Firestore, Storage
- **react-navigation v7**
- **Package manager: pnpm** (not npm/yarn — use `pnpm add` for new dependencies)

### Key Data Flow Patterns

- All screens subscribe to Firestore via `onSnapshot` in `componentDidMount` and store the `unsubscribe` reference for cleanup in `componentWillUnmount`.
- Medicine data is fetched globally then joined client-side (no Firestore joins). The pattern: fetch `medicine` collection → use result to filter `prescription`/`reminder`/`history`.
- `HomeScreen` computes a medication adherence score (`value`) from taken vs. missed history; this drives the `TreeImage` growth animation.
- **Known issue:** Several screens have N+1 Firestore query patterns and expensive per-render computations. See [`docs/roadmap.md`](docs/roadmap.md) before modifying data-fetching logic.

### Reminders / Alarms

`src/utilities/UserReminders.js` manages device alarms via `react-native-alarm-notification`:
- `setReminders(email)` – called on login; schedules all active reminders from Firestore
- `deleteReminders(email)` – called on logout; cancels all device alarms
- Notification tap navigates to `ChangeReminder` using `NavigationService` (bypasses component prop navigation)

### Screens by Feature

- **AuthStack** (`src/screens/AuthStack/`) – Login, Register, ForgotPassword, Terms
- **HomeStack** (`src/screens/HomeStack/`) – Dashboard showing today's taken/upcoming medicines + TreeImage adherence visual
- **MedicineStack** (`src/screens/MedicineStack/`) – Medicine list, add medicine (barcode scan or manual), daily/weekly reminder creation and editing
- **DoctorStack** (`src/screens/DoctorStack/`) – View accessed doctors/pharmacists, grant access, appointment booking
- **CalendarStack** (`src/screens/CalendarStack/`) – Calendar view of medication history
- **MoreStack** (`src/screens/MoreStack/`) – Appointment list, edit profile, change password, help, terms
- **DrawerMenu** (`src/routes/DrawerMenu/`) – Right-side drawer with profile info and navigation options

### Shared Components

- `Background` – decorative background used across multiple screens
- `TreeImage` – displays a growing tree image based on a `value` (0–100) adherence percentage, using 5 static PNG frames
- `TermsServices` – reusable terms text component

### Utilities

- `typography.js` – sets default font overrides at app start (called in `index.js`)
- `UploadImage.js` – Firebase Storage upload helper
- `UserPermissions.js` – camera/photo library permission requests
