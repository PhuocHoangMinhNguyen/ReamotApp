# Bug Fix & Improvement Roadmap

Generated from QA review on 2026-03-05. Issues ordered by priority — highest impact first.

---

## Phase 1 — Critical Fixes

### TS-002: Weekly Reminders Rescheduled +1 Day Instead of +7
**Files:**
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:137`
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:137`

**Problem:** `WeeklyChangeReminder.handleYes()` advances the next alarm by `setDate(getDate() + 1)` — one day, not seven. After the first "Miss", weekly reminders become daily alarms permanently.

**Fix:** Change `setDate(getDate() + 1)` to `setDate(getDate() + 7)` in `WeeklyChangeReminder` only.

---

### TS-003: Reminder Lookup by Medicine Name Unreliable (Two Reminders Same Medicine)
**Files:**
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:71-95`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:71-95`

**Problem:** Both screens query reminders by medicine name, then match by comparing `Math.floor(paramsTime.getTime() / 1000)` to `documentSnapshot.data().time.seconds`. If a patient has two reminders for the same medicine at different times, the comparison may resolve to the wrong document (or empty string), causing silent delete/update failures on the wrong reminder.

**Fix:** Pass the Firestore document ID via navigation params directly from `MediInfoScreen` so `ChangeReminder` can look up the document by ID instead of by name+time comparison.

---

### TS-006: VerificationScreen `navigate('App')` Targets Non-Existent Route
**File:** `src/screens/VerificationScreen.js:35`

**Problem:** After email verification succeeds, the code calls `this.props.navigation.navigate('App')`. The `'App'` route name does not exist in the navigator — authenticated state is managed via `onAuthStateChanged` in `LoadingScreen`. This call silently fails; users are permanently stuck on the verification screen.

**Fix:** Navigate to `'Loading'` instead to re-trigger the auth state check, or call `auth().currentUser.reload()` then manually navigate to the correct authenticated route.

---

### TS-014 (Security): `medicine` Write Rule `if false` Blocks Patient-Added Medicines
**Files:**
- `src/screens/MedicineStack/AddMedicine.js:89`
- `firestore.rules:65`

**Problem:** The Firestore rule `allow write: if false` on the `medicine` collection silently rejects all patient-written medicine documents. The subsequent `prescription` write still executes, creating orphaned prescriptions with no corresponding medicine entry. Medicine list joins fail silently.

**Fix:** Change the rule to `allow write: if request.auth != null` (or stricter role check), OR move patient-added medicines to a `userMedicine/{uid}` sub-collection scoped to the patient.

---

### TS-016 (Security): `isGrantedAccessToPatient` Looks Up Users by Email Instead of UID
**File:** `firestore.rules:17-21`

**Problem:** `get(/databases/$(database)/documents/users/$(patientEmail))` uses email as the document path, but `users` documents are keyed by Firebase Auth UID. The lookup always returns a non-existent document, making `patientDoc.data.doctorList` evaluate to an error. Doctor and pharmacist access to patient data is entirely broken in production.

**Fix:** Store an email→UID mapping or query by a field. Alternatively, key `users` documents by email, or add a Firestore `userByEmail/{email}` lookup collection.

---

## Phase 2 — High Severity

### TS-001: `deleteReminders` Inner Promise Not Awaited
**File:** `src/utilities/UserReminders.js:19-29`

**Problem:** `deleteReminders` is `async` but the inner `firestore().collection('reminder').get().then(...)` is returned (not awaited). Callers that `await deleteReminders(email)` resolve immediately before `deleteAlarm` calls run. Stale device alarms remain after logout.

**Fix:** Replace with `await firestore().collection('reminder').get()` and loop with `await` in the callback body.

---

### TS-004: BarcodeScan Firestore Writes Not Awaited Before Navigation
**File:** `src/screens/MedicineStack/BarcodeScan.js:97-145`

**Problem:** Inside the `.then()` block, `mPills.doc(...).update(...)` and `history.add(...)` are not awaited before `navigation.navigate('MedicineScreen')`. On write failure, the user is navigated away silently and the history record is never stored.

**Fix:** Rewrite with `async/await` and await each write before navigating. Wrap in `try/catch` to surface errors.

---

### TS-007: `RegisterScreen` Stores `doctorList: null` Instead of `[]`
**File:** `src/screens/AuthStack/RegisterScreen.js:80-86`

**Problem:** New user documents are created with `doctorList: null` and `pharmacistList: null`. The Firestore rule `isGrantedAccessToPatient` does `currentEmail() in patientDoc.data.doctorList`, which throws when the field is `null` instead of an array. All doctor/pharmacist access checks error out for new users.

**Fix:** Initialize as `doctorList: []` and `pharmacistList: []`.

---

### TS-008: `AppointmentList` Accesses `currentUser.email` Without Null Guard
**File:** `src/screens/MoreStack/AppointmentList.js:24`

**Problem:** `auth().currentUser.email` accessed directly in `componentDidMount`. If `currentUser` is `null` (expired session or race condition), throws `TypeError: Cannot read property 'email' of null`.

**Fix:** Add `const user = auth().currentUser; if (!user) return;` at the top of `componentDidMount`.

---

### TS-009: `getANid()` Uses Hardcoded 200ms `setTimeout` — Race Condition
**Files:**
- `src/screens/MedicineStack/DailyReminder/NewReminder.js:65-94`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyNewReminder.js:65-94`

**Problem:** `getANid()` waits 200ms then calls `getScheduledAlarms()`. On slow devices or under load, the native alarm may not be registered yet, so `idAN` is stored as `''`. A reminder with empty `idAN` cannot be deleted from the device later.

**Fix:** Retry `getScheduledAlarms()` in a loop (up to ~10 times, 100ms apart) until the new alarm ID appears in the list, or falls back after a timeout.

---

### TS-010: `MediInfoScreen` Crashes with `RangeError` When `prescription.times` is Undefined
**File:** `src/screens/MedicineStack/MediInfoScreen.js:244-250`

**Problem:** `Array(prescription.times - reminder.length)` when `prescription.times` is `undefined` produces `Array(NaN)` which throws `RangeError: Invalid array length`. Occurs on slow networks before the subscription fires.

**Fix:** Guard with `if (!prescription || prescription.times == null) return [];` before computing `paddedReminder`.

---

### TS-011: `AddMedicine` Duplicates Global Medicine Catalogue Entries
**Files:**
- `src/screens/MedicineStack/AddMedicine.js:89-97`
- `src/screens/MedicineStack/MedicineScreen.js:51-60`

**Problem:** `addMedicine()` always creates a new `medicine` document without checking if one with the same name already exists. Duplicate entries cause the medicine list to show duplicate rows.

**Fix:** Query `medicine` collection for existing name before inserting. If found, reuse the existing document ID.

---

### TS-012: `MediInfoScreen` Pill Count Accepts `NaN` Input
**File:** `src/screens/MedicineStack/MediInfoScreen.js:182-195`

**Problem:** `parseInt(add)` returns `NaN` for non-numeric input (e.g. pasted text). `NaN` is written to Firestore as the new `pills` value. `keyboardType="numeric"` does not prevent paste on all platforms.

**Fix:** Validate `!isNaN(parseInt(add, 10)) && parseInt(add, 10) > 0` before updating.

---

### TS-017 (Security): `reminder` Write Rule Uses `resource.data` on Create
**File:** `firestore.rules:42-47`

**Problem:** `allow write: if resource.data.patientEmail == currentEmail()` uses `resource.data` (the pre-image). On a `create` operation, the pre-image does not exist, causing an error. Reminder creation may silently fail in production Firestore.

**Fix:** Split rules: `allow create: if request.resource.data.patientEmail == currentEmail();` and `allow update, delete: if resource.data.patientEmail == currentEmail();`

---

### TS-026: `AddMedicine` Has No `.catch()` — Silent Failure on Write Error
**File:** `src/screens/MedicineStack/AddMedicine.js:89-133`

**Problem:** Neither the `medicine.add()` nor `prescription.add()` chains have `.catch()` handlers. Firestore write failures show no user feedback; the button appears to do nothing.

**Fix:** Add `.catch(error => Toast.show(error.message))` to both Promise chains.

---

### TS-028: `DoctorInfoScreen.handleYes()` Shows Success Toast Even on Batch Failure
**Files:**
- `src/screens/DoctorStack/DoctorInfoScreen.js:62-66`
- `src/screens/DoctorStack/AccessedDoctorScreen.js:76-80`

**Problem:** `batch.commit().then(...)` has no `.catch()`. If the commit fails, the dialog closes and the success Toast fires anyway. User believes access was granted when it was not.

**Fix:** Add `.catch(error => Toast.show(error.message))` and keep the dialog open on failure.

---

## Phase 3 — Medium Priority

### TS-005: `BarcodeScan` Alert Fires After `barcodeRead = true`
**File:** `src/screens/MedicineStack/BarcodeScan.js:148`

**Problem:** `Alert.alert('Alarm Sound is Stopped')` is called unconditionally outside the `if (barcodeRead === false)` guard. After the first successful scan, every subsequent camera scan event triggers the alert again.

**Fix:** Move `Alert.alert(...)` inside the `if (barcodeRead === false)` block.

---

### TS-013: `DoctorScreen` `in` Query Fails With > 30 Entries
**File:** `src/screens/DoctorStack/DoctorScreen.js:58-91`

**Problem:** Firestore `in` operator supports max 30 elements. If `doctorList` or `pharmacistList` exceeds 30, the query throws `invalid-argument`. Screen silently shows empty.

**Fix:** Chunk the array into groups of 30 and run parallel `in` queries; merge results client-side.

---

### TS-015 (Security): Doctor Document Write Rule Uses `resource.data` on Create
**File:** `firestore.rules:70-74`

**Problem:** `allow write: if resource.data.doctorEmail == currentEmail()` errors on create (no pre-image). New doctor profiles cannot be created via client. Additionally, no field-level validation prevents a doctor from zeroing out `patientList` on update.

**Fix:** Split into `allow create` (using `request.resource.data`) and `allow update` with field validation.

---

### TS-021: `AppointmentMaker` Accepts Past Dates
**File:** `src/screens/DoctorStack/AppointmentMaker.js:81`

**Problem:** No validation that selected appointment datetime is in the future.

**Fix:** Validate `selectedDate > Date.now()` before saving.

---

### TS-023: `MediInfoScreen` Non-Numeric Pill Count Writes `NaN` to Firestore
*(See TS-012 — same root cause, medium-priority input path)*

---

### TS-024: `AppointmentMaker` Missing Reason Validation
**File:** `src/screens/DoctorStack/AppointmentMaker.js:81-101`

**Problem:** Empty `reason` field passes validation. Blank appointment records written to Firestore.

**Fix:** Validate `reason.trim() !== ''` before saving.

---

### TS-027: `EditScreen` Missing Input Validation
**File:** `src/screens/MoreStack/EditScreen.js:71-96`

**Problem:** No validation before Firestore write. User can save a blank name and phone number.

**Fix:** Add `name.trim() !== ''` check (mirrors `RegisterScreen` validation).

---

### TS-029: `UploadImage` Anti-Pattern: Async Executor in Promise Constructor
**File:** `src/utilities/UploadImage.js:10-28`

**Problem:** `new Promise(async (res, rej) => {...})` — if the `async` body throws before calling `rej`, the rejection is silently swallowed.

**Fix:** Rewrite as a plain `async` function using `await`.

---

## Phase 4 — Low Priority / Performance

### TS-020: `HomeScreen` Dual `history` Listeners
**File:** `src/screens/HomeStack/HomeScreen.js:59-105`

**Problem:** Two Firestore listeners on `history` — one for all history, one filtered by `status == 'missed'`. Doubles read cost. Missed count can be derived client-side from the first listener.

**Fix:** Remove the second listener; compute missed count from the first subscription's data.

---

### TS-022: `CalendarScreen` Full Medicine Fetch on Every Mount
**File:** `src/screens/CalendarStack/CalendarScreen.js:129-134`

**Problem:** Full `medicine` collection `.get()` on every navigation to CalendarScreen. Cache the result or use a module-level variable.

---

### TS-031: Alarm ID Collision Range Too Small in ChangeReminder
**Files:**
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:34`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:34`

**Problem:** `Math.floor(Math.random() * 10000)` — only 10,000 possible IDs. With multiple reminders, collision probability is non-trivial. NewReminder uses `1e9`.

**Fix:** Use `Math.floor(Math.random() * 1e9)` consistently.

---

### TS-033: `RegisterScreen` `createUserWithEmailAndPassword` Not Tested
**File:** `__tests__/screens/RegisterScreen.test.js:62-82`

**Problem:** Password and phone inputs lack `testID` — the Firebase create user call is never exercised in the test suite.

**Fix:** Add `testID` props to password/phone inputs; add happy-path test covering the full `createUser()` flow.

---

### TS-034: Doctor/More Stack Screens Have Zero Test Coverage

**Problem:** `AppointmentList`, `AppointmentMaker`, `DoctorInfoScreen`, `AccessedDoctorScreen`, `AddAccess`, `DoctorScreen`, `CalendarScreen`, `EditScreen`, `ChangePassword`, `HelpScreen`, `ForgotPasswordScreen` — no tests exist.

---

### TS-035: Firestore Security Rules Have No Automated Tests
**File:** `tests/backend/`

**Problem:** Firebase Emulator not configured; critical rule bugs (TS-016, TS-017) only discoverable in production.

**Fix:** Set up Firebase Emulator locally; add `@firebase/rules-unit-testing` test suite.

---

### TS-036: `UserReminders.test.js` `idAN` Matching Is a No-Op
**File:** `__tests__/utilities/UserReminders.test.js:130-146`

**Problem:** `expect.any(String)` is used for the mock `alarmId`, so the lookup logic that finds the correct `idAN` is never actually validated. Test passes even if `idAN` is always `''`.

---

### TS-037: `console.log` With Sensitive Data in Production Code
**Files:**
- `src/utilities/UserReminders.js:34`
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:82`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:82`
- `src/screens/MedicineStack/DailyReminder/NewReminder.js` (various)

**Problem:** Production code logs scheduled alarm lists and document IDs. Should be removed or gated behind a `__DEV__` flag.

---

## Status Tracking

- [x] TS-002 — Weekly reminders rescheduled +1 day instead of +7
- [x] TS-003 — Reminder lookup by medicine name unreliable
- [x] TS-006 — VerificationScreen `navigate('App')` non-existent route
- [x] TS-014 — `medicine` write rule `if false` blocks patient-added medicines
- [x] TS-016 — `isGrantedAccessToPatient` uses email instead of UID
- [x] TS-001 — `deleteReminders` inner Promise not awaited
- [x] TS-004 — BarcodeScan writes not awaited before navigation
- [x] TS-007 — `RegisterScreen` stores `doctorList: null` instead of `[]`
- [x] TS-008 — `AppointmentList` null guard on `currentUser`
- [x] TS-009 — `getANid()` 200ms setTimeout race condition
- [x] TS-010 — `MediInfoScreen` `RangeError` on undefined `prescription.times`
- [x] TS-011 — `AddMedicine` duplicates global medicine catalogue entries
- [x] TS-012 — `MediInfoScreen` pill count accepts `NaN` input
- [x] TS-017 — `reminder` write rule uses `resource.data` on create
- [x] TS-026 — `AddMedicine` no `.catch()` on write errors
- [x] TS-028 — `DoctorInfoScreen` success toast on batch failure
- [x] TS-005 — `BarcodeScan` alert fires after `barcodeRead = true`
- [x] TS-013 — `DoctorScreen` `in` query fails with > 30 entries
- [x] TS-015 — Doctor document write rule uses `resource.data` on create
- [x] TS-021 — `AppointmentMaker` accepts past dates
- [x] TS-024 — `AppointmentMaker` missing reason validation
- [x] TS-027 — `EditScreen` missing input validation
- [x] TS-029 — `UploadImage` async executor anti-pattern
- [x] TS-020 — `HomeScreen` dual `history` listeners
- [x] TS-022 — `CalendarScreen` full medicine fetch on every mount
- [x] TS-031 — Alarm ID collision range too small in ChangeReminder
- [x] TS-033 — `RegisterScreen` `createUserWithEmailAndPassword` not tested
- [x] TS-034 — Doctor/More stack screens have zero test coverage
- [x] TS-035 — Firestore security rules have no automated tests
- [x] TS-036 — `UserReminders.test.js` `idAN` matching is a no-op
- [ ] TS-037 — `console.log` with sensitive data in production code
