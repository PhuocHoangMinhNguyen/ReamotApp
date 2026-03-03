# Performance Optimization Roadmap

Generated from analysis on 2026-03-03. Issues are ordered by priority — highest impact, lowest effort first.

---

## Phase 1 — Critical Fixes (Immediate)

These issues cause exponential performance degradation as user data grows.

### P1-1: Eliminate N+1 Queries in CalendarScreen
**File:** `src/screens/CalendarStack/CalendarScreen.js:122-139`
**Severity:** Critical

**Problem:** A Firestore `.get()` call is made inside a `forEach` loop on snapshot results. A patient with 20 history entries triggers 20 separate network calls, each individually calling `setState()` and `calculate()`.

```js
// Current (broken) pattern:
querySnapshot.forEach(doc => {
  firestore().collection('medicine')
    .where('name', '==', doc.data().medicine)
    .get()             // ← one network call per item
    .then(() => {
      this.setState(...)  // ← re-render per item
      this.calculate()    // ← recalculate per item
    });
});
```

**Fix:** Pre-fetch the entire `medicine` collection once and build a `Map<name, medicineDoc>`. Resolve all history items against the Map in a single synchronous pass, then call `setState` and `calculate` once.

---

### P1-2: Move HomeScreen Counting Logic Out of Render
**File:** `src/screens/HomeStack/HomeScreen.js:200-209`
**Severity:** Critical

**Problem:** An O(n) `for` loop that counts upcoming reminders runs on every render. HomeScreen re-renders frequently because three simultaneous `onSnapshot` listeners each call `setState`.

```js
// Currently runs on every render:
for (let i = 0; i < this.state.remindermedicines.length; i++) {
  if (reminderTime.toDateString() == today && ...) counting++;
}
```

**Fix:** Compute and store `upcomingCount` inside the `onSnapshot` callback. Only recalculate when reminder data actually changes.

---

### P1-3: Batch HomeScreen Firestore Joins
**File:** `src/screens/HomeStack/HomeScreen.js:34-125`
**Severity:** Critical

**Problem:** Three concurrent `onSnapshot` listeners (history, missed, reminders) each perform O(n×m) client-side joins against the medicine collection on every update.

**Fix:** Subscribe to the `medicine` collection once and store results in a component-level Map. Reference that Map in all three other listeners instead of re-iterating.

---

## Phase 2 — High Severity Fixes

### P2-1: Fix FlatList Key Extractors
**Files:**
- `src/screens/MedicineStack/MedicineScreen.js:218`
- `src/screens/HomeStack/HomeScreen.js:250-266`
- `src/screens/MedicineStack/MediInfoScreen.js:396`
**Severity:** High

**Problem:** `keyExtractor={(item, index) => index.toString()}` (or no `keyExtractor`) forces React Native to re-render the entire list on any state change, even when only one item changed.

**Fix:** Use the Firestore document ID as the key:
```js
keyExtractor={(item) => item.id}
```

---

### P2-2: Fix State Mutation in Render Path
**File:** `src/screens/MedicineStack/MediInfoScreen.js:234-242`
**Severity:** High

**Problem:** The render method directly mutates `this.state.reminder` via `.push()`. This causes React to miss updates and produces unpredictable behaviour.

```js
// Never mutate state directly:
this.state.reminder.push('null');
```

**Fix:** Derive the padded array in the `onSnapshot` callback using a new array: `[...existing, ...padding]`, then store via `setState`.

---

### P2-3: Audit and Consolidate onSnapshot Listeners
**Files:**
- `src/screens/MedicineStack/MediInfoScreen.js:41-104` — 3 concurrent listeners
- `src/screens/DoctorStack/DoctorScreen.js` — nested `onSnapshot` callbacks
**Severity:** High

**Problem:** Multiple listeners per screen visit can accumulate if `componentWillUnmount` cleanup timing is off (e.g., fast navigation). This drains battery and memory over a session.

**Fix:** Store all unsubscribe functions in an array and call them all in `componentWillUnmount`. Consider consolidating queries where possible.

---

## Phase 3 — Medium Severity Improvements

### P3-1: Add Image Caching with react-native-fast-image
**Files:** All screens rendering `item.image` URI from Firebase Storage
**Severity:** Medium

**Problem:** React Native's `Image` component has no cache by default. Medicine images re-fetch from Firebase Storage on every list scroll or screen revisit.

**Fix:** Replace `<Image>` with `<FastImage>` from `react-native-fast-image`. It is a drop-in replacement with disk-backed caching.

```bash
pnpm add react-native-fast-image
```

---

### P3-2: Debounce Medicine Search Input
**File:** `src/screens/MedicineStack/MedicineScreen.js:184-195`
**Severity:** Medium

**Problem:** Uppercasing and filtering the full array runs on every single keystroke with no throttling.

**Fix:** Wrap `searchFilterFunction` in a 200–300 ms debounce. Store the debounced reference in the constructor and cancel it in `componentWillUnmount`.

---

### P3-3: Lazy-Load Tree Image Assets
**File:** `src/components/TreeImage.js:11-32`
**Severity:** Medium

**Problem:** All 6 PNG frames (~471 KB combined, with `GrowingTree.png` alone at 151 KB) are statically `require()`d at bundle time, even though only one is ever displayed.

**Fix:** Replace individual `require()` calls with a lookup array indexed by the `value` range. Alternatively, convert to a Lottie animation (`.json`) which will be significantly smaller.

---

### P3-4: Batch Firestore Writes in UserReminders
**File:** `src/utilities/UserReminders.js:68-100`
**Severity:** Medium

**Problem:** `findIdAN()` issues a separate Firestore document update for each alarm inside a nested loop. On login with many reminders, this serialises many individual writes.

**Fix:** Collect all updates in a `firestore().batch()` and commit once after the loop.

---

### P3-5: Enable Lazy Tab Initialization
**File:** `src/routes/BottomTabs.js`
**Severity:** Low

**Problem:** All 5 tab stacks mount on app cold start, even if the user never visits them in that session.

**Fix:** Add `lazy: true` to the bottom tab navigator config (React Navigation v7 supports this). Screens will mount only on first visit.

---

## Summary Table

| ID | Issue | File(s) | Severity | Effort |
|---|---|---|---|---|
| P1-1 | N+1 queries in CalendarScreen | CalendarScreen.js:122 | Critical | Medium |
| P1-2 | Counting loop in render | HomeScreen.js:200 | Critical | Low |
| P1-3 | Triple onSnapshot joins | HomeScreen.js:34 | Critical | Medium |
| P2-1 | Bad FlatList key extractors | MedicineScreen, HomeScreen, MediInfoScreen | High | Low |
| P2-2 | State mutation in render | MediInfoScreen.js:234 | High | Low |
| P2-3 | Unmanaged onSnapshot listeners | MediInfoScreen.js, DoctorScreen.js | High | Medium |
| P3-1 | No image caching | All screens with URI images | Medium | Low |
| P3-2 | Unthrottled search filter | MedicineScreen.js:184 | Medium | Low |
| P3-3 | All tree images eager-loaded | TreeImage.js:11 | Medium | Low |
| P3-4 | Sequential Firestore writes | UserReminders.js:68 | Medium | Medium |
| P3-5 | No lazy tab loading | BottomTabs.js | Low | Trivial |

---

## Status Tracking

- [x] P1-1 — N+1 queries in CalendarScreen
- [x] P1-2 — Counting loop in render (HomeScreen)
- [x] P1-3 — Triple onSnapshot joins (HomeScreen)
- [x] P2-1 — FlatList key extractors
- [x] P2-2 — State mutation in render (MediInfoScreen)
- [x] P2-3 — Unmanaged onSnapshot listeners
- [x] P3-1 — Image caching (react-native-fast-image)
- [x] P3-2 — Debounce search filter
- [x] P3-3 — Lazy-load tree images
- [x] P3-4 — Batch Firestore writes (UserReminders)
- [x] P3-5 — Lazy tab initialization
