// Tests for the medicine search filter in MedicineScreen.
//
// The filter lives in MedicineScreen.searchFilterFunction()
// (src/screens/MedicineStack/MedicineScreen.js:156-167).
//
// We test the algorithm in isolation without rendering the component.

/** Mirrors MedicineScreen.searchFilterFunction */
function searchFilter(medicines, searchText) {
  return medicines.filter(item => {
    const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
    const textData = searchText.toUpperCase();
    return itemData.indexOf(textData) > -1;
  });
}

const MEDICINES = [
  { name: 'Aspirin' },
  { name: 'Amoxicillin' },
  { name: 'Paracetamol' },
  { name: 'Ibuprofen' },
  { name: null },           // edge case: medicine with no name
];

describe('medicine search filter', () => {
  it('returns all items when the search string is empty', () => {
    expect(searchFilter(MEDICINES, '')).toHaveLength(MEDICINES.length);
  });

  it('matches by partial name (case-insensitive)', () => {
    const results = searchFilter(MEDICINES, 'asp');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Aspirin');
  });

  it('is case-insensitive', () => {
    expect(searchFilter(MEDICINES, 'ASPIRIN')).toHaveLength(1);
    expect(searchFilter(MEDICINES, 'aspirin')).toHaveLength(1);
    expect(searchFilter(MEDICINES, 'AsPiRiN')).toHaveLength(1);
  });

  it('returns multiple results when the prefix matches several items', () => {
    const results = searchFilter(MEDICINES, 'a'); // Aspirin + Amoxicillin
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('returns an empty array when no name matches', () => {
    expect(searchFilter(MEDICINES, 'zzz')).toHaveLength(0);
  });

  it('handles a medicine with a null name without crashing', () => {
    // The null-name item should be excluded from results (empty string never
    // matches a non-empty search text).
    const results = searchFilter(MEDICINES, 'x');
    expect(results.every(m => m.name !== null)).toBe(true);
  });

  it('matches a full exact name', () => {
    expect(searchFilter(MEDICINES, 'Paracetamol')).toHaveLength(1);
  });
});
