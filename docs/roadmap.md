# Bug Fix & Improvement Roadmap

Generated from QA review on 2026-03-04. Issues ordered by priority — highest impact first.

---

## Phase 1 — Critical Fixes

### TS-026: VerificationScreen Stuck After Email Verified
**File:** `src/screens/VerificationScreen.js:34`

**Problem:** `auth().currentUser.reload()` updates the local user object but does NOT re-trigger `onAuthStateChanged`. The `if (emailVerified)` block is empty with a comment claiming the listener will fire automatically — it will not. Users who verify their email and return to the app are permanently stuck on this screen until they sign out and back in.

**Fix:** Explicitly call `this.props.navigation.navigate('App')` when `emailVerified` is `true`.

---

### TS-013: Weekly Reminders Rescheduled as `once` on Login
**File:** `src/utilities/UserReminders.js:10-15`

**Problem:** `alarmNotifData` hardcodes `schedule_type: 'once'`. On every login, `setReminders` uses this constant for all reminders regardless of type. Weekly reminders (which have `type: 'Weekly'` in Firestore) are rescheduled as one-shot alarms — they fire once then stop permanently.

**Fix:** When constructing `details` per reminder, read `documentSnapshot.data().type` and set `schedule_type: type === 'Weekly' ? 'weekly' : 'once'`.

---

### TS-004: DoctorScreen Crash on New User (Missing `exists()` Guard)
**File:** `src/screens/DoctorStack/DoctorScreen.js:44`

**Problem:** Race condition between Firebase auth state change (which redirects to App stack) and the Firestore `users` document write in `RegisterScreen.createUser`. `DoctorScreen` can mount before the document exists. `documentSnapshot.data()` returns `undefined` on a non-existent document, crashing on `.doctorList`.

**Fix:** Add `if (!documentSnapshot.exists()) return;` before accessing `.data()`.

---

## Phase 2 — High Severity

### TS-011: Destructive Avatar Update in EditScreen
**File:** `src/screens/MoreStack/EditScreen.js:77`

**Problem:** `editProfile` writes `avatar: null` unconditionally before attempting the upload. A network failure between the two writes permanently deletes the user's existing avatar with no recovery path.

**Fix:** Only include `avatar: null` in the `update()` call when no new avatar is selected (`!avatar`). Restructure to set the avatar URL only after a successful upload.

---

### TS-012: Prescription Listener Memory Leak in MedicineScreen
**File:** `src/screens/MedicineStack/MedicineScreen.js:41-65`

**Problem:** `prescriptionCollection()` sets `this.prescriptionUnsub` each time it is called. The outer medicine collection listener calls `prescriptionCollection(temp)` on every snapshot without unsubscribing the previous prescription listener first — the old listener leaks. Every global `medicine` update (e.g. any patient adding a medicine) creates a new leaked listener.

**Fix:** At the top of `prescriptionCollection`, add `if (this.prescriptionUnsub) { this.prescriptionUnsub(); }` before assigning the new listener.

---

### TS-024: LoadingScreen Auth Listener Never Unsubscribed
**File:** `src/screens/LoadingScreen.js:12`

**Problem:** `onAuthStateChanged` listener is registered in the constructor/componentDidMount with no cleanup. If the screen ever re-mounts, multiple listeners accumulate and fire redundant `navigate()` calls, potentially corrupting navigation state.

**Fix:** Store the unsubscribe return value and call it in `componentWillUnmount`.

---

### TS-005: Null Unsubscribe Crash in ChangeReminder / WeeklyChangeReminder
**Files:**
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:99`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:99`

**Problem:** `componentWillUnmount` calls `this.unsubscribe()` unconditionally, but `this.unsubscribe` is initialized to `null`. Fast back-navigation before the Firestore listener attaches causes `TypeError: this.unsubscribe is not a function`.

**Fix:** `if (this.unsubscribe) this.unsubscribe();`

---

### TS-006: Null Unsubscribe Crash in AppointmentList
**File:** `src/screens/MoreStack/AppointmentList.js:49`

**Problem:** Same null unsubscribe pattern as TS-005.

**Fix:** `if (this.unsubscribe) this.unsubscribe();`

---

### TS-001: `.catch().then()` Chain Inversion in LoginScreen
**File:** `src/screens/AuthStack/LoginScreen.js:49`

**Problem:** `.catch()` is chained before `.then()`. A caught error returns `undefined` which resolves the chain, so `.then()` always runs after any error. The `if (auth().currentUser)` guard is the only thing preventing `setReminders(null)` from being called on failure.

**Fix:** Reorder to `.then().catch()`, or rewrite with `async/await` and `try/catch`.

---

### TS-002: No Error Handling on `sendPasswordResetEmail`
**File:** `src/screens/AuthStack/ForgotPasswordScreen.js:32`

**Problem:** No `.catch()` on `sendPasswordResetEmail`. Errors (invalid email, user not found, network failure) are silently swallowed — user sees nothing.

**Fix:** Add `.catch(error => Toast.show(error.message))`.

---

### TS-003: `db.set()` Fire-and-Forget in RegisterScreen
**File:** `src/screens/AuthStack/RegisterScreen.js:81`

**Problem:** `db.set({...})` is not awaited and has no `.catch()`. Write failures are invisible. If the Firestore write fails, the user has a Firebase Auth account but no Firestore profile document, breaking the entire app for that user.

**Fix:** `await db.set({...})` inside the existing `try/catch` block.

---

### TS-008: `mPills.doc(undefined)` Crash in BarcodeScan
**File:** `src/screens/MedicineStack/BarcodeScan.js:116`

**Problem:** `temporaryID` is derived from a Firestore query. If no `medicinePills` document exists for the scanned medicine, `temporaryID` is `undefined`. `mPills.doc(undefined).update(...)` throws a Firestore error.

**Fix:** Guard with `if (temporaryID) { mPills.doc(temporaryID).update(...); }`.

---

### TS-020: Double Prescription / Double `goBack()` in AddMedicine
**File:** `src/screens/MedicineStack/AddMedicine.js:99`

**Problem:** Both `dailyType` and `weeklyType` can be `true` simultaneously due to the checkbox mutual-exclusion logic using `!=` instead of `!==`. When both are `true`, `addMedicine` creates two prescription documents and calls `goBack()` twice, corrupting the navigation stack.

**Fix:** Fix mutual-exclusion logic to use strict equality and ensure only one type can be active. Add a guard before each `goBack()` to prevent double-navigation.

---

### TS-030: Race Condition — `idAN` Written as `''` in NewReminder
**Files:**
- `src/screens/MedicineStack/DailyReminder/NewReminder.js:66`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyNewReminder.js:66`

**Problem:** `getANid()` calls `ReactNativeAN.getScheduledAlarms()` immediately after `scheduleAlarm()`. If the native module registers the alarm asynchronously, `getScheduledAlarms()` returns before the alarm appears. `idAN` is written as `''` to Firestore — a reminder with empty `idAN` cannot be deleted from the device later.

**Fix:** Add a short delay before `getScheduledAlarms()`, or retry until the newly scheduled alarm ID appears in the list.

---

### TS-032: Any Patient Can Write to Global Medicine Catalog
**File:** `src/screens/MedicineStack/AddMedicine.js:89`

**Problem:** The `medicine` collection is a global catalog shared by all users. Any authenticated patient can write arbitrary entries to it (fake medicine names, malformed barcodes). This is a shared mutable store with no access control at the client or Firestore rules level.

**Fix:** Add a Firestore security rule restricting `medicine` writes to admin/doctor roles, or store patient-added medicines in a `prescriptionMedicine` sub-collection scoped to the patient.

---

## Phase 3 — Medium Priority

### TS-009: `item.startTime.toDate()` Without Null Guard in CalendarScreen
**File:** `src/screens/CalendarStack/CalendarScreen.js:199`

**Problem:** Crashes if a history document is missing the `startTime` field (written by an older app version or external source).

**Fix:** `{item.startTime ? moment(item.startTime.toDate()).format('hh:mm a') : ''}`

---

### TS-025: `navigate('MedicineScreen')` Pushes Instead of Pops
**Files:**
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:179`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:179`

**Problem:** After handling a reminder, calling `navigate('MedicineScreen')` from within `MedicineStack` pushes a new instance instead of popping back. Stack grows unboundedly: MedicineScreen → MediInfoScreen → ChangeReminder → (back) → ChangeReminder → MediInfoScreen → MedicineScreen (new).

**Fix:** Use `this.props.navigation.popToTop()` instead.

---

### TS-031: Alarm ID Collision Range Too Small in ChangeReminder
**Files:**
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:34`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:34`

**Problem:** `Math.floor(Math.random() * 10000)` — only 10,000 possible IDs vs `1e9` in `NewReminder`. With multiple active reminders, collision probability is non-trivial. A collision silently cancels the wrong alarm.

**Fix:** Use `Math.floor(Math.random() * 1e9)` consistently.

---

### TS-038: Flash Toggle Not Wired to RNCamera
**File:** `src/screens/MedicineStack/BarcodeScan.js:165`

**Problem:** `handleTourch` toggles `this.state.flashOn` but `flashMode` prop is never passed to `RNCamera`. The icon changes but the camera flash never actually toggles.

**Fix:** Add `flashMode={this.state.flashOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}` to the `RNCamera` component.

---

### TS-039: Blank `<Text />` Items in HomeScreen FlatList
**File:** `src/screens/HomeStack/HomeScreen.js:154`

**Problem:** `renderReminder` returns an empty `<Text />` for reminders that are not today/upcoming. These blank items occupy space in the horizontal list and the user can scroll into blank space.

**Fix:** Filter `remindermedicines` before passing to FlatList to only include today's upcoming items.

---

### TS-019: Zero Values Pass Validation in AddMedicine
**File:** `src/screens/MedicineStack/AddMedicine.js:57`

**Problem:** `number == '0'` and `times == '0'` pass the non-empty check. A prescription of 0 capsules 0 times is accepted and written to Firestore.

**Fix:** Validate `parseInt(number) > 0` and `parseInt(times) > 0`.

---

### TS-021: No Future-Date Validation in AppointmentMaker
**File:** `src/screens/DoctorStack/AppointmentMaker.js:81`

**Problem:** A user can create an appointment for a past date/time with no error.

**Fix:** Validate that the selected datetime is after `Date.now()` before saving.

---

### TS-023: Non-Numeric Pill Count Writes `NaN` to Firestore
**File:** `src/screens/MedicineStack/MediInfoScreen.js:168`

**Problem:** `parseInt('abc', 10)` returns `NaN`, which is stored in Firestore. Subsequent reads render `NaN` in the UI.

**Fix:** Validate that `medicinePills` is a valid positive integer before calling `addMedicinePills`.

---

### TS-035: Missing `keyExtractor` in AddAccess FlatList
**File:** `src/screens/DoctorStack/AddAccess.js:173`

**Problem:** No `keyExtractor` prop — React Native uses index-based keys, causing incorrect renders on list filter updates.

**Fix:** Add `keyExtractor={item => item.key}`.

---

### TS-034: `auth().currentUser` Null Guard Missing in ChangePassword
**File:** `src/screens/MoreStack/ChangePassword.js:17`

**Problem:** `auth().currentUser.email` accessed without null guard. Crashes on expired Firebase session.

**Fix:** Add `const user = auth().currentUser; if (!user) return;` at the top of the method.

---

## Phase 4 — Low Priority

### TS-014: Extra Firestore Reads Per Snapshot in CalendarScreen
**File:** `src/screens/CalendarStack/CalendarScreen.js:54`

**Problem:** `calculate()` issues 2 additional `get()` calls on every `onSnapshot` update. Derive counts directly from the snapshot data instead.

---

### TS-016: Full Collection Scan in AddAccess
**File:** `src/screens/DoctorStack/AddAccess.js:56`

**Problem:** Entire `doctor` and `pharmacist` collections are streamed with live listeners; all filtering is client-side. Also, the two listener callbacks can produce a briefly inconsistent state (doctors reset to `[]` while pharmacists still show old data).

**Fix:** Use `.get()` for the users document, then query only the professionals not already in the patient's list.

---

### TS-017: No Password Length Validation in RegisterScreen
**File:** `src/screens/AuthStack/RegisterScreen.js:50`

**Problem:** Firebase requires ≥6 characters but the UI only surfaces this after a round-trip with the raw SDK error string.

**Fix:** Validate `password.length >= 6` before calling Firebase, show a friendly message.

---

### TS-028: Unnecessary Double `setState` in NewReminder
**Files:**
- `src/screens/MedicineStack/DailyReminder/NewReminder.js:58`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyNewReminder.js:58`

**Problem:** Two sequential `setState` calls trigger two renders. Merge into one.

---

### TS-036: Missing `keyExtractor` in AppointmentList FlatLists
**File:** `src/screens/MoreStack/AppointmentList.js:89`

**Fix:** Add `keyExtractor={item => item.key}` to both FlatLists.

---

### TS-040: `NaN` Data Passed to ProgressChart
**File:** `src/screens/CalendarStack/CalendarScreen.js:86`

**Problem:** When no history exists for a date, `0 / 0 = NaN` is passed to `ProgressChart`.

**Fix:** `const safePercentage = isNaN(percentage) ? 0 : percentage;`

---

### TS-041: Repeated `toDate()` Calls in HomeScreen `renderReminder`
**File:** `src/screens/HomeStack/HomeScreen.js:154`

**Problem:** `item.time.toDate()` and `Date.now()` called multiple times per item per render.

**Fix:** Compute once at the top of `renderReminder`.

---

## Status Tracking

- [x] TS-026 — VerificationScreen stuck after email verified
- [x] TS-013 — Weekly reminders rescheduled as `once` on login
- [x] TS-004 — DoctorScreen crash on new user (missing `exists()` guard)
- [x] TS-011 — Destructive avatar update in EditScreen
- [x] TS-012 — Prescription listener memory leak in MedicineScreen
- [x] TS-024 — LoadingScreen auth listener never unsubscribed
- [x] TS-005 — Null unsubscribe crash in ChangeReminder / WeeklyChangeReminder
- [x] TS-006 — Null unsubscribe crash in AppointmentList
- [x] TS-001 — `.catch().then()` chain inversion in LoginScreen
- [x] TS-002 — No error handling on `sendPasswordResetEmail`
- [x] TS-003 — `db.set()` fire-and-forget in RegisterScreen
- [x] TS-008 — `mPills.doc(undefined)` crash in BarcodeScan
- [x] TS-020 — Double prescription / double `goBack()` in AddMedicine
- [x] TS-030 — Race condition — `idAN` written as `''` in NewReminder
- [x] TS-032 — Any patient can write to global medicine catalog
- [x] TS-009 — `item.startTime.toDate()` without null guard in CalendarScreen
- [x] TS-025 — `navigate('MedicineScreen')` pushes instead of pops
- [x] TS-031 — Alarm ID collision range too small in ChangeReminder
- [x] TS-038 — Flash toggle not wired to RNCamera
- [x] TS-039 — Blank `<Text />` items in HomeScreen FlatList
- [x] TS-019 — Zero values pass validation in AddMedicine
- [x] TS-021 — No future-date validation in AppointmentMaker
- [x] TS-023 — Non-numeric pill count writes `NaN` to Firestore
- [x] TS-035 — Missing `keyExtractor` in AddAccess FlatList
- [x] TS-034 — `auth().currentUser` null guard missing in ChangePassword
- [x] TS-014 — Extra Firestore reads per snapshot in CalendarScreen
- [x] TS-016 — Full collection scan in AddAccess
- [x] TS-017 — No password length validation in RegisterScreen
- [x] TS-028 — Unnecessary double `setState` in NewReminder
- [x] TS-036 — Missing `keyExtractor` in AppointmentList FlatLists
- [x] TS-040 — `NaN` data passed to ProgressChart
- [x] TS-041 — Repeated `toDate()` calls in HomeScreen `renderReminder`
