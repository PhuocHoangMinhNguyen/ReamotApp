# Bug Fix & Improvement Roadmap

Generated from QA review on 2026-03-03. Issues ordered by priority — highest impact first.

---

## Phase 1 — Critical Fixes

### P1-1: Four Broken `onPress` Handlers
**Files:**
- `src/screens/DoctorStack/DoctorScreen.js:193`
- `src/screens/DoctorStack/DoctorInfoScreen.js:112`
- `src/screens/DoctorStack/AppointmentMaker.js:185`
- `src/screens/MoreStack/EditScreen.js:151`

**Problem:** All four buttons use `onPress={() => this.methodName}` — a reference to the method without calling it. Pressing these buttons does nothing. Affected flows: give doctor access, confirm doctor access grant, book an appointment, save profile edits.

**Fix:** Change `onPress={() => this.methodName}` to `onPress={this.methodName}`.

---

### P1-2: `name.trim` Not Called — Validation Always Bypassed
**Files:**
- `src/screens/AuthStack/RegisterScreen.js:46,48`
- `src/screens/MedicineStack/AddMedicine.js:55`

**Problem:** `name.trim == ''` compares the *function reference* to `''`, which is always `false`. Empty name/email fields silently pass validation and write blank strings to Firebase Auth and Firestore.

**Fix:** Change `name.trim == ''` to `name.trim() === ''`.

---

### P1-3: `auth().currentUser` Null Crashes
**Files:**
- `src/screens/HomeStack/HomeScreen.js:37`
- `src/screens/HomeStack/HomeScreen.js:122-124`
- `src/screens/HomeStack/HomeScreen.js:201`
- `src/screens/CalendarStack/CalendarScreen.js:56,68,122`

**Problem:** `auth().currentUser.email` is called without a null guard. If `currentUser` is transiently null (e.g. during logout or Firebase re-initialization), the app crashes. Additionally, `item.time` and `item.startTime` are called with `.toDate()` without null guards — malformed Firestore documents crash the render.

**Fix:** Add `const user = auth().currentUser; if (!user) return;` at the top of `componentDidMount` and `calculate()`. Guard `item.time` and `item.startTime` before calling `.toDate()`.

---

### P1-4: Premature Navigation in `addMedicine`
**File:** `src/screens/MedicineStack/AddMedicine.js:126-127`

**Problem:** `this.props.navigation.goBack()` and `Toast.show(...)` are called immediately after initiating the async Firestore write, not inside `.then()`. Success toast fires even if the write fails; navigation happens before the `prescription` document write begins.

**Fix:** Move `goBack()` and `Toast.show()` inside the innermost `.then()` callback after all writes complete.

---

### P1-5: `createUser` Error Handling Race Condition
**File:** `src/screens/AuthStack/RegisterScreen.js:63-98`

**Problem:** If `createUserWithEmailAndPassword` fails, the `.catch()` sets `errorMessage` but the next line `await auth().currentUser.sendEmailVerification()` is called regardless — potentially sending a verification email to the wrong (already signed-in) user.

**Fix:** Check for the error before calling `sendEmailVerification`. Use try/catch properly instead of chaining `.catch()` on the awaited expression.

---

## Phase 2 — High Severity

### P2-1: Leaked `prescription` Listener in MedicineScreen
**File:** `src/screens/MedicineStack/MedicineScreen.js:40-64`

**Problem:** The inner `onSnapshot` on the `prescription` collection is never stored and never unsubscribed. Every visit to `MedicineScreen` adds a permanent listener. Over multiple navigations, listeners accumulate — draining battery and calling `setState` on unmounted components.

**Fix:** Store `this.prescriptionUnsub = firestore()...onSnapshot(...)` and call it in `componentWillUnmount`.

---

### P2-2: `deleteAlarms` Uses `onSnapshot` Instead of `.get()`
**File:** `src/screens/MedicineStack/MedicineScreen.js:113-131`

**Problem:** A permanent `onSnapshot` listener is created during a delete operation, and the unsubscribe handle is discarded. The listener persists for the app session.

**Fix:** Replace `onSnapshot(...)` with `.get().then(...)` since no real-time updates are needed for deletion.

---

### P2-3: Non-Atomic Doctor Access Writes
**Files:**
- `src/screens/DoctorStack/DoctorInfoScreen.js:39-55`
- `src/screens/DoctorStack/AccessedDoctorScreen.js:53-89`

**Problem:** Two independent Firestore writes per access grant/revoke. A network failure between them leaves inconsistent state — a privacy-sensitive operation with no self-healing path.

**Fix:** Use `firestore().batch()` to make both writes atomic.

---

### P2-4: Alarm ID Collision Range Too Small
**Files:**
- `src/screens/MedicineStack/DailyReminder/NewReminder.js:47`
- `src/screens/MedicineStack/WeeklyReminder/WeeklyNewReminder.js:46`
- `src/screens/MedicineStack/BarcodeScan.js:36`
- `src/utilities/UserReminders.js:48`

**Problem:** `Math.floor(Math.random() * 10000)` — only 10,000 possible IDs. A collision silently marks the new alarm as Inactive, meaning a medication reminder never fires. Directly undermines the app's core purpose.

**Fix:** Increase range to `Math.floor(Math.random() * 1e9)` or use a UUID.

---

### P2-5: `AddAccess` Listener Race Condition + Duplicate Items
**File:** `src/screens/DoctorStack/AddAccess.js:33-99`

**Problem:** Three `onSnapshot` listeners registered concurrently. The doctor/pharmacist collection listeners may fire before the `users` document listener, leaving `tempDoctorEmail` as `[]`. Already-granted doctors appear as available. Additionally, each re-fire of any listener appends to `temp`, producing duplicate entries.

**Fix:** Use `.get()` for the users document (no real-time needed), then subscribe to doctor/pharmacist collections after the data is available.

---

### P2-6: `doc.data()` Null Guard Missing
**Files:**
- `src/routes/DrawerMenu/ProfileScreen.js:26`
- `src/screens/MoreStack/EditScreen.js:46`

**Problem:** If the `users` Firestore document doesn't exist (partial registration, manual deletion), `doc.data()` returns `undefined`. Subsequent access to `.avatar`, `.name`, `.email` crashes.

**Fix:** Add `if (doc.exists()) { this.setState({ user: doc.data() }); }`.

---

### P2-7: `CalendarScreen` Sets `medicine: null` for Empty State
**File:** `src/screens/CalendarStack/CalendarScreen.js:136`

**Problem:** `this.setState({ medicine: result.length > 0 ? result : null })` sets `medicine` to `null` when empty. `FlatList` receives `data={null}` and causes a React Native warning.

**Fix:** Use `this.setState({ medicine: result })` — an empty array is the correct empty sentinel.

---

### P2-8: TreeImage Receives `NaN` for New Users
**File:** `src/screens/HomeStack/HomeScreen.js:215-224`

**Problem:** When a patient has no history and no reminders, `value = 0 / 0 = NaN`. `NaN` is passed to `TreeImage`, which falls through all comparisons and shows the fully-grown tree — misleading for a brand-new user.

**Fix:** Guard `const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;` before passing to `TreeImage`.

---

### P2-9: `CalendarScreen` `calculate()` Stale State Race
**File:** `src/screens/CalendarStack/CalendarScreen.js:116-138`

**Problem:** If the user changes the date rapidly, two `loadItems()` calls are in flight. The second cancels the first listener, but the first `calculate()` may still be running and will call `setState` with stale chart data for the old date.

**Fix:** Use an `isCancelled` flag per `loadItems()` invocation, checked before `setState` in `calculate()`.

---

## Phase 3 — Medium / Low

### P3-1: User Enumeration via Firebase Auth Error Messages
**File:** `src/screens/AuthStack/LoginScreen.js:49-57`

**Problem:** Firebase Auth error messages (e.g. "no user with this email") are shown directly in the UI, allowing enumeration of registered email addresses.

**Fix:** Display a generic "Incorrect email or password" message for all auth errors.

---

### P3-2: Dead Code in `CalendarScreen.renderItem`
**File:** `src/screens/CalendarStack/CalendarScreen.js:187-192`

**Problem:** The `if (item.date == ...)` check is always true — the Firestore query already filters by date. The fallback `<Text style={{ height: 0.1 }} />` never renders. Dead code adds visual noise.

**Fix:** Remove the conditional and always return `correctItem`.

---

### P3-3: Wrong App Name in Login Screen
**File:** `src/screens/AuthStack/LoginScreen.js:131`

**Problem:** "New to SocialApp?" — copy-paste leftover from a template.

**Fix:** Change to "New to Reamot?".

---

### P3-4: Typos in AppointmentList
**File:** `src/screens/MoreStack/AppointmentList.js:64,88`

**Problem:** "Appoiment Time" and "Upcomming Appointments".

**Fix:** "Appointment Time" and "Upcoming Appointments".

---

### P3-5: No Loading Indicators on Key Screens
**Files:** HomeScreen, CalendarScreen, DoctorScreen, MediInfoScreen

**Problem:** Screens show empty-state UI while Firestore data is being fetched. On slow networks this looks like an error.

**Fix:** Add `loading: true` initial state and render an `ActivityIndicator` until the first snapshot fires.

---

### P3-6: Weekly Reminder Fires Daily
**Files:** `src/screens/MedicineStack/WeeklyReminder/WeeklyNewReminder.js`, `WeeklyChangeReminder.js`

**Problem:** Weekly reminders use `schedule_type: 'once'` — identical to daily reminders. A "weekly" reminder fires at the same frequency as a daily reminder.

**Fix:** Use the correct `schedule_type` for weekly recurrence per the `react-native-alarm-notification` API.

---

## Status Tracking

- [x] P1-1 — Four broken `onPress` handlers
- [x] P1-2 — `name.trim` not called
- [x] P1-3 — `auth().currentUser` null crashes
- [x] P1-4 — Premature navigation in `addMedicine`
- [x] P1-5 — `createUser` error handling race condition
- [x] P2-1 — Leaked `prescription` listener in MedicineScreen
- [x] P2-2 — `deleteAlarms` uses `onSnapshot` instead of `.get()`
- [x] P2-3 — Non-atomic doctor access writes
- [x] P2-4 — Alarm ID collision range too small
- [x] P2-5 — `AddAccess` listener race condition + duplicates
- [x] P2-6 — `doc.data()` null guard missing
- [x] P2-7 — `CalendarScreen` sets `medicine: null` for empty state
- [x] P2-8 — TreeImage receives `NaN` for new users
- [x] P2-9 — `CalendarScreen` stale `calculate()` race
- [x] P3-1 — User enumeration via auth error messages
- [x] P3-2 — Dead code in `CalendarScreen.renderItem`
- [x] P3-3 — Wrong app name "SocialApp" in LoginScreen
- [x] P3-4 — Typos in AppointmentList
- [x] P3-5 — No loading indicators on key screens
- [x] P3-6 — Weekly reminder fires daily
