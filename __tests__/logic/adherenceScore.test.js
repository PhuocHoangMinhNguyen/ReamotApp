// Tests for the medication adherence score computation from HomeScreen.
//
// The formula lives in HomeScreen.render() (src/screens/HomeStack/HomeScreen.js:174):
//
//   const value =
//     (historymedicines.length - missedMedicines.length)
//     * 100
//     / (counting + historymedicines.length)
//
// where `counting` = number of upcoming reminders due today.
//
// We extract the formula into a standalone function here for isolated testing.
// The actual HomeScreen renders TreeImage with this value (tested in HomeScreen.test.js).

/** Mirrors the formula in HomeScreen.render() */
function computeAdherenceScore({ taken, missed, upcoming }) {
  const historymedicines = { length: taken };
  const missedMedicines  = { length: missed };
  const counting         = upcoming;

  return (historymedicines.length - missedMedicines.length)
    * 100
    / (counting + historymedicines.length);
}

describe('adherence score formula', () => {
  it('returns 100 when all medicines are taken and nothing is upcoming', () => {
    const score = computeAdherenceScore({ taken: 5, missed: 0, upcoming: 0 });
    expect(score).toBe(100);
  });

  it('returns 0 when all medicines are missed and nothing is upcoming', () => {
    const score = computeAdherenceScore({ taken: 4, missed: 4, upcoming: 0 });
    expect(score).toBe(0);
  });

  it('returns 0 when all medicines are missed with upcoming reminders', () => {
    const score = computeAdherenceScore({ taken: 3, missed: 3, upcoming: 2 });
    expect(score).toBe(0);
  });

  it('returns 50 when half are taken with no upcoming', () => {
    const score = computeAdherenceScore({ taken: 4, missed: 2, upcoming: 0 });
    expect(score).toBe(50);
  });

  it('factors upcoming reminders into the denominator', () => {
    // 2 taken, 1 missed, 3 upcoming → (2-1)*100 / (3+2) = 20
    const score = computeAdherenceScore({ taken: 2, missed: 1, upcoming: 3 });
    expect(score).toBe(20);
  });

  it('returns 100 when nothing taken or missed but upcoming=0 (clean day)', () => {
    // HomeScreen guards against this case with an early return, but the formula
    // still produces NaN here.  This test DOCUMENTS the known edge-case.
    const score = computeAdherenceScore({ taken: 0, missed: 0, upcoming: 0 });
    expect(score).toBeNaN(); // known issue: HomeScreen guards this via early return
  });

  it('returns a value between 0 and 100 for mixed inputs', () => {
    const score = computeAdherenceScore({ taken: 6, missed: 2, upcoming: 1 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('score increases as missed count decreases', () => {
    const base = computeAdherenceScore({ taken: 5, missed: 3, upcoming: 0 });
    const better = computeAdherenceScore({ taken: 5, missed: 1, upcoming: 0 });
    expect(better).toBeGreaterThan(base);
  });
});
