# Bug Fix & Improvement Roadmap

Generated from QA review on 2026-03-06. Issues ordered by priority — highest impact first.

---

## Phase 1 — Critical Bugs (crashes / data loss)

### CRIT-001: Race Condition — `setReminders` Stores Empty `idAN`
**File:** `src/utilities/UserReminders.js:44–98`

**Problem:** `ReactNativeAN.scheduleAlarm(details)` is fire-and-forget (synchronous JS call, async native side). `getScheduledAlarms()` is called immediately after all alarms are scheduled, before the OS has registered them. The ID lookup finds no match and writes `idAN: ''` to Firestore. On the next login, `deleteReminders` calls `deleteAlarm('')` which is a no-op — device alarms accumulate with each login and can never be cleared.

**Fix:** After scheduling all alarms, retry `getScheduledAlarms()` in a loop (up to 10 attempts, 100ms apart) until all expected alarm IDs appear in the result, then commit the batch.

---

### CRIT-002: `deleteAlarm` Called Without Null Guard on `idAN`
**Files:**
- `src/utilities/UserReminders.js:25`
- `src/screens/MedicineStack/MedicineScreen.js:134–136`
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:101`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:101`

**Problem:** All four call sites execute `idAN.toString()` with no null guard. When CRIT-001 has written `idAN: ''` and it is later read back as `null`/`undefined`, calling `.toString()` on it throws `TypeError` and crashes. In `MedicineScreen.deleteAlarms`, this is inside a `.then()` chain with no `.catch()`, so the exception is silently swallowed — the reminder document is deleted but the device alarm is never cancelled.

**Fix:** Guard every call site with `if (idAN) { ReactNativeAN.deleteAlarm(idAN.toString()); }` before invoking `deleteAlarm`.

---

### CRIT-003: `BarcodeScan.onBarCodeRead` — Un-awaited Chains, Navigation Inside `.then()`
**File:** `src/screens/MedicineStack/BarcodeScan.js:116–147`

**Problem:** After the alarm update and history write complete, the pill-decrement logic runs as a fire-and-forget `.then()` chain. `navigation.navigate('MedicineScreen')` and `Alert.alert` sit inside that chain's inner callback. If any Firestore call throws, navigation never occurs and the user is stuck on the scan screen. Additionally, `Alert.alert('Alarm Sound is Stopped')` is outside the `if (barcodeRead === false)` guard, so it fires on every subsequent camera scan event after the first success.

**Fix:** Rewrite the pill-decrement block with `async/await` inside a `try/catch`. Move `Alert.alert` inside the guard. Place `navigation.navigate` at the end of the `try` block so it always runs after all writes, regardless of whether the pill update succeeded.

---

### CRIT-004: `DrawerMenu.handleSignOut` Crashes When Session Has Expired
**File:** `src/routes/DrawerMenu/DrawerMenu.js:24–27`

**Problem:** `auth().currentUser.email` is accessed without a null check. If the Firebase session has already expired (or the user was force-signed out), `currentUser` is `null` and `.email` throws `TypeError`, crashing the app before `signOut()` can run.

**Fix:** Add `const user = auth().currentUser; if (!user) { auth().signOut(); return; }` at the start of `handleSignOut`, and use `user.email` for the `deleteReminders` call.

---

### CRIT-005: `EditScreen.componentWillUnmount` Calls `null()` When Unmounted Before Mount Completes
**File:** `src/screens/MoreStack/EditScreen.js:53–55`

**Problem:** `this.unsubscribe` is initialised to `null` and only assigned inside `componentDidMount`. If the user navigates back before the Firestore listener is set up (rapid back tap on slow network), `componentWillUnmount` calls `this.unsubscribe()` which is `null()` — a `TypeError` crash.

**Fix:** Add a null guard: `if (this.unsubscribe) { this.unsubscribe(); }`.

---

### CRIT-006: `MedicineScreen.prescriptionCollection` Crashes When Auth Session Expires
**File:** `src/screens/MedicineStack/MedicineScreen.js:47–68`

**Problem:** The outer `medicine` `onSnapshot` listener calls `prescriptionCollection(temp)` on every catalog change. Inside, `auth().currentUser.email` is accessed without a null guard. If the auth session expires while the screen is mounted, `currentUser` is `null`, causing a `TypeError` crash. The outer listener is not unsubscribed during the crash, leaving it active and repeatedly crashing the app.

**Fix:** At the top of `prescriptionCollection`, guard with `const currentUser = auth().currentUser; if (!currentUser) return;` and use `currentUser.email` for the query.

---

## Phase 2 — High Priority (significant UX / functionality problems)

### HIGH-001: No Loading State on Login / Register — Double-Tap Causes Duplicate Requests
**Files:**
- `src/screens/AuthStack/LoginScreen.js`
- `src/screens/AuthStack/RegisterScreen.js`

**Problem:** No `loading` state and no button disabled state during Firebase auth calls. Rapid double-taps issue multiple concurrent requests. On `RegisterScreen` this can result in duplicate `createUserWithEmailAndPassword` calls.

**Fix:** Set `loading: true` before the async call, disable the submit button while loading, and reset to `false` in both the success and error paths.

---

### HIGH-002: `RegisterScreen` Does Not Roll Back Firebase Auth User on Firestore Write Failure
**File:** `src/screens/AuthStack/RegisterScreen.js:65–107`

**Problem:** If the Firebase Auth user is created (step 1) but the subsequent Firestore `users` or `userByEmail` write fails, the `catch` block shows an error but does not delete the partially created Auth user. The user now has a Firebase account with no Firestore document; every screen that reads `users/{uid}` will encounter undefined data.

**Fix:** In the `catch` block, call `auth().currentUser?.delete()` to clean up the orphaned Auth account before surfacing the error.

---

### HIGH-003: `AddMedicine` Deduplication Is Non-Transactional — Concurrent Adds Create Duplicates
**File:** `src/screens/MedicineStack/AddMedicine.js:112–138`

**Problem:** The existence check uses a one-time `.get()` query, not a Firestore transaction. Two patients adding the same medicine name simultaneously both pass the check and each inserts a duplicate `medicine` document. The `MedicineScreen` join logic matches on name string equality, so duplicates appear twice in every patient's prescription list.

**Fix:** Wrap the existence check and insert in a Firestore transaction, or use a deterministic document ID (e.g. a slug of the medicine name) so duplicate writes are idempotent.

---

### HIGH-004: `AppointmentList` Past/Upcoming Classification Never Refreshes During Session
**File:** `src/screens/MoreStack/AppointmentList.js:25–49`

**Problem:** `const dateNow = new Date()` is captured once at `componentDidMount`. The `onSnapshot` callback fires repeatedly as data changes but always compares against the original mount time. An appointment that was upcoming when the screen first opened remains "upcoming" even after its time has passed, until the user navigates away and back.

**Fix:** Replace the `dateNow` constant with `new Date()` evaluated inside the `onSnapshot` callback so each update uses the current time.

---

### HIGH-005: Module-Level `_medicineCache` in `CalendarScreen` Is a Shared Mutable Reference
**File:** `src/screens/CalendarStack/CalendarScreen.js:29`

**Problem:** `let _medicineCache = null` persists for the entire app lifetime. Once populated, the cache is never invalidated — medicine catalog updates in Firestore are never reflected in the calendar history view for the rest of the session. Additionally, `_medicineCache = this.medicineMap` stores a reference to a mutable `Map`, so mutations by a new component instance corrupt the shared cache.

**Fix:** Either invalidate the cache when the `medicine` collection snapshot updates, or remove the module-level cache and instead subscribe to medicine changes via `onSnapshot` and merge with history data reactively.

---

### HIGH-006: `ChangeReminder` / `WeeklyChangeReminder` — Same Race as CRIT-001 on Reschedule
**Files:**
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:113–168`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:113–168`

**Problem:** Both `handleYes` handlers call `ReactNativeAN.scheduleAlarm(details)` then immediately `await ReactNativeAN.getScheduledAlarms()`. The native alarm is almost certainly not registered yet, so `idAN` is always stored as `''` after a missed-dose reschedule. Future deletion of this alarm is impossible.

**Fix:** Apply the same retry loop fix as CRIT-001 — poll `getScheduledAlarms()` until the new alarm ID appears, with a timeout fallback.

---

### HIGH-007: `MedicineScreen.deleteAlarms` Has No Error Handling — Silent Failure Leaves Orphaned Alarms
**File:** `src/screens/MedicineStack/MedicineScreen.js:121–141`

**Problem:** The entire `deleteAlarms` chain has no `.catch()`. If any Firestore `.get()` or `.delete()` fails, the exception is silently swallowed. The prescription document is deleted first (in the caller), then `deleteAlarms` is called — if `deleteAlarms` fails silently, the prescription is gone but the reminder documents and device alarms remain active.

**Fix:** Add a `.catch()` handler that shows a `Toast` error. Consider reversing the deletion order: delete reminders first, then the prescription.

---

### HIGH-008: `NewReminder` / `WeeklyNewReminder` — `getANid` Not Awaited; Fires on Unmounted Component
**Files:**
- `src/screens/MedicineStack/DailyReminder/NewReminder.js:103–125`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyNewReminder.js:103–125`

**Problem:** `this.getANid(details)` is an async function called without `await`. The schedule button is not disabled during the 1-second polling window. If the user taps back during polling, `getANid` eventually resolves, calls `firestore().add(...)`, then calls `this.props.navigation.goBack()` on an already-unmounted component.

**Fix:** Await `getANid` and disable the button while it runs. Add a mounted guard (`this._mounted`) and check it before calling `goBack()`.

---

### HIGH-009: `DoctorScreen` `=== null` Guard Misses `undefined` — Crashes for Older User Documents
**File:** `src/screens/DoctorStack/DoctorScreen.js:62–66`

**Problem:** The guard `if (tempDoctorEmail === null)` does not catch `undefined`, which is what Firestore returns for fields that do not exist. Any user document created before `doctorList`/`pharmacistList` were added will have `tempDoctorEmail === undefined`, causing `undefined.length` to throw `TypeError`.

**Fix:** Change the guard to `if (!tempDoctorEmail && !tempPharmacistEmail) return;` (falsy check) so both `null` and `undefined` are handled.

---

## Phase 3 — Medium Priority

### MED-001: No Client-Side Email Format Validation on Auth Screens
**Files:**
- `src/screens/AuthStack/LoginScreen.js`
- `src/screens/AuthStack/RegisterScreen.js`
- `src/screens/AuthStack/ForgotPasswordScreen.js`

**Problem:** The only email validation is `trim() === ''`. Strings like `"notanemail"` pass and are sent to Firebase, which returns a generic error.

**Fix:** Validate with a simple regex (e.g. `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) before submitting.

---

### MED-002: Phone Number Field Accepts Non-Numeric Paste Despite `keyboardType="numeric"`
**Files:**
- `src/screens/AuthStack/RegisterScreen.js`
- `src/screens/MoreStack/EditScreen.js`

**Problem:** `keyboardType="numeric"` is a keyboard hint only; it does not prevent paste of non-numeric strings. No runtime validation is performed before writing to Firestore.

**Fix:** Validate `phoneNumber` with `/^\d+$/` before submitting.

---

### MED-003: Medicines Added Without a Barcode Cannot Be Confirmed "Taken" via Scan
**File:** `src/screens/MedicineStack/BarcodeScan.js:60`

**Problem:** `if (barcode === e.data)` — when `barcode` is `undefined` (medicine added without a barcode), this is always `false`. The Alert shows `'Required Barcode is undefined'`. The user is stuck on the scan screen with no back button and no way to confirm the dose.

**Fix:** Either prevent navigation to `BarcodeScan` when `barcode` is falsy (and use a manual "confirm taken" tap instead), or add a back button to the scan screen as a fallback.

---

### MED-004: `HomeScreen` `upcoming` Count Can Diverge from Rendered List
**File:** `src/screens/HomeStack/HomeScreen.js:237–244`

**Problem:** `upcomingCount` is computed in the `onSnapshot` callback using a snapshot-time `now`, while the rendered `FlatList` filter uses `Date.now()` evaluated on every render. If the component re-renders between these two evaluations, the adherence score (`value`) passed to `TreeImage` can differ from the count of items actually visible.

**Fix:** Compute the filter and counts in the same place (either both in the snapshot callback or both in `render`), using a single consistent `Date.now()` call.

---

### MED-005: `MediInfoScreen` Uses String Sentinel `'null'` Instead of JS `null`
**File:** `src/screens/MedicineStack/MediInfoScreen.js:209`

**Problem:** Empty reminder slots are represented as the string `'null'` and compared with `=== 'null'`. If any real reminder field ever contains the string `'null'`, it would be misidentified as an empty slot.

**Fix:** Use `null` (JS null) as the sentinel value and check with `=== null`.

---

### MED-006: Negative Pill Count Shows Read-Only Display With No Corrective Action
**File:** `src/screens/MedicineStack/MediInfoScreen.js:332–352`

**Problem:** When `parseInt(this.state.text, 10) < 0`, the UI renders a plain `<Text>` with the negative number and no input or button to correct it. The patient cannot refill from this state without restarting the add-pills flow.

**Fix:** Clamp pill count at 0 in the `BarcodeScan` pill-decrement write, and/or show the add-pills input when the count is 0 or negative.

---

### MED-007: `ChangeReminder` / `WeeklyChangeReminder` `.delete()` Has No Error Handling
**Files:**
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:92–105`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:92–105`

**Problem:** `.delete()` has no `.catch()`. On network failure, the exception is swallowed, `Toast` and `goBack()` are never called, and the user receives no feedback.

**Fix:** Add `.catch(error => Toast.show(error.message))`.

---

### MED-008: `AppointmentMaker.handleYes` Has No Error Handling on Firestore Write
**File:** `src/screens/DoctorStack/AppointmentMaker.js:85–106`

**Problem:** The `firestore().collection('appointment').add(...)` call has no `.catch()`. Silent failure means the user gets no confirmation that their appointment was not saved.

**Fix:** Add `.catch(error => Toast.show(error.message))` and keep the dialog open on failure.

---

### MED-009: `RegisterScreen` Has No "Confirm Password" Field
**File:** `src/screens/AuthStack/RegisterScreen.js`

**Problem:** A user who mistypes their password will have the account created with the wrong password. They will not discover this until login, requiring a "Forgot Password" flow.

**Fix:** Add a `confirmPassword` field and validate `password === confirmPassword` before submitting.

---

### MED-010: `CalendarScreen` `FlatList` Missing `keyExtractor`
**File:** `src/screens/CalendarStack/CalendarScreen.js:209–213`

**Problem:** No `keyExtractor` prop; React Native falls back to using the array index as key, producing incorrect reconciliation when items are added or removed and a console warning.

**Fix:** Add `keyExtractor={item => item.key}` (or appropriate unique field).

---

### MED-011: `UploadImage.uploadPhotoAsync` Has No Error Handling on `fetch` / `.blob()`
**File:** `src/utilities/UploadImage.js:9–12`

**Problem:** If the local file URI is invalid or has been deleted from the gallery, `fetch(uri)` or `response.blob()` throws an unhandled rejection. In `AddMedicine.addMedicine`, the upload sits outside the try/catch for the medicine existence check, so upload failure prevents the prescription from being added with no user feedback.

**Fix:** Wrap `fetch` and `blob` in try/catch; surface the error to the caller.

---

## Phase 4 — Low Priority / Nice-to-Have

### LOW-001: `console.log` in Production Paths May Expose Patient Data
**Files:**
- `src/utilities/UserReminders.js:32`
- `src/screens/MedicineStack/DailyReminder/NewReminder.js:165`
- `src/screens/MedicineStack/DailyReminder/ChangeReminder.js:122,125`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder.js:122,125`
- `src/screens/DoctorStack/AppointmentMaker.js:92`
- `src/screens/MedicineStack/BarcodeScan.js:71`

**Problem:** Multiple `console.log` calls in production code log alarm objects and appointment times, which may contain patient medication data visible in crash reporters.

**Fix:** Remove or gate behind `if (__DEV__)`.

---

### LOW-002: `DoctorScreen` `SectionList` `keyExtractor` Produces `[object Object]N`
**File:** `src/screens/DoctorStack/DoctorScreen.js:206`

**Problem:** `keyExtractor={(item, index) => item + index}` — `item` is an object; string coercion produces `[object Object]0`, `[object Object]1`, etc. All keys effectively collide, causing incorrect list reconciliation.

**Fix:** Use a unique field: `keyExtractor={(item, index) => (item.email || item.key || '') + index}`.

---

### LOW-003: `DrawerMenu.handleSignOut` Does Not Await `deleteReminders` Before `signOut()`
**File:** `src/routes/DrawerMenu/DrawerMenu.js:24–27`

**Problem:** `deleteReminders` is async but not awaited. `signOut()` fires immediately after; if Firebase revokes the auth token before `deleteReminders` finishes its Firestore queries (possible with strict security rules), the queries fail and device alarms are never deleted.

**Fix:** Make `handleSignOut` async and `await UserReminders.deleteReminders(user.email)` before calling `auth().signOut()`.

---

### LOW-004: `EditScreen` Toast Typo — "editted"
**File:** `src/screens/MoreStack/EditScreen.js:101`

**Problem:** `Toast.show('Your Account Details is editted !')` — "editted" should be "edited".

**Fix:** Correct the spelling.

---

### LOW-005: `AddMedicine` `note` Field Initialised to `null` Causes Controlled/Uncontrolled Warning
**File:** `src/screens/MedicineStack/AddMedicine.js:31,284`

**Problem:** `note: null` is passed as the `value` prop to a `TextInput`. React Native treats `null` as an uncontrolled input; when the user types something, `onChangeText` switches it to controlled, producing a warning.

**Fix:** Initialise to `note: ''`.

---

### LOW-006: `BarcodeScan` Has No Back Button — User Trapped When Barcode Cannot Be Scanned
**File:** `src/screens/MedicineStack/BarcodeScan.js`

**Problem:** The scan screen has no visible back navigation. Combined with MED-003 (medicines without barcodes), a user can be permanently stuck on this screen with no OS-level back gesture on some Android devices.

**Fix:** Add a back `TouchableOpacity` in the overlay to call `navigation.goBack()`.

---

### LOW-007: `MedicationInformation` Imports `ScrollView` from `react-native-gesture-handler`
**File:** `src/screens/HomeStack/MedicationInformation.js:8`

**Problem:** `react-native-gesture-handler`'s `ScrollView` is only needed inside a gesture responder context. Importing it in a standalone screen is unnecessary and misleading.

**Fix:** Import `ScrollView` from `react-native` instead.

---

### LOW-008: `CalendarScreen` Two Sequential `setState` Calls Per Snapshot Cause Double Render
**File:** `src/screens/CalendarStack/CalendarScreen.js:128–130`

**Problem:** `this.setState({ medicine, loading: false })` followed immediately by `this.calculate(...)` (which calls `setState` again) triggers two renders per snapshot update.

**Fix:** Merge both state updates into a single `setState` call.

---

## Status Tracking

- [x] CRIT-001 — Race condition: `setReminders` stores empty `idAN`
- [x] CRIT-002 — `deleteAlarm` called without null guard on `idAN`
- [x] CRIT-003 — `BarcodeScan` un-awaited chains, navigation inside `.then()`
- [x] CRIT-004 — `DrawerMenu.handleSignOut` crashes when session expired
- [x] CRIT-005 — `EditScreen.componentWillUnmount` calls `null()`
- [x] CRIT-006 — `MedicineScreen.prescriptionCollection` crashes on auth expiry
- [x] HIGH-001 — No loading state on login / register
- [x] HIGH-002 — `RegisterScreen` no Auth user rollback on Firestore failure
- [x] HIGH-003 — `AddMedicine` non-transactional deduplication
- [x] HIGH-004 — `AppointmentList` past/upcoming classification stale
- [x] HIGH-005 — `CalendarScreen` module-level `_medicineCache` shared mutable reference
- [x] HIGH-006 — `ChangeReminder` / `WeeklyChangeReminder` reschedule race condition
- [x] HIGH-007 — `MedicineScreen.deleteAlarms` no error handling, orphaned alarms
- [x] HIGH-008 — `NewReminder` / `WeeklyNewReminder` `getANid` not awaited
- [x] HIGH-009 — `DoctorScreen` `=== null` guard misses `undefined`
- [x] MED-001 — No client-side email format validation
- [x] MED-002 — Phone number accepts non-numeric paste
- [x] MED-003 — Medicines without barcodes cannot be confirmed via scan
- [x] MED-004 — `HomeScreen` upcoming count can diverge from rendered list
- [x] MED-005 — `MediInfoScreen` string sentinel `'null'` instead of JS `null`
- [x] MED-006 — Negative pill count shows read-only display
- [x] MED-007 — `ChangeReminder` / `WeeklyChangeReminder` `.delete()` no error handling
- [x] MED-008 — `AppointmentMaker.handleYes` no error handling
- [x] MED-009 — `RegisterScreen` no confirm password field
- [x] MED-010 — `CalendarScreen` `FlatList` missing `keyExtractor`
- [x] MED-011 — `UploadImage` no error handling on `fetch` / `.blob()`
- [x] LOW-001 — `console.log` in production paths
- [x] LOW-002 — `DoctorScreen` `SectionList` `keyExtractor` produces `[object Object]N`
- [x] LOW-003 — `DrawerMenu` `deleteReminders` not awaited before `signOut()`
- [x] LOW-004 — `EditScreen` toast typo "editted"
- [x] LOW-005 — `AddMedicine` `note` initialised to `null`
- [x] LOW-006 — `BarcodeScan` no back button
- [x] LOW-007 — `MedicationInformation` wrong `ScrollView` import
- [x] LOW-008 — `CalendarScreen` double `setState` per snapshot
