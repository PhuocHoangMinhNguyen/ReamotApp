// Manual mock for @react-native-firebase/firestore
//
// Usage in tests:
//   import firestore from '@react-native-firebase/firestore';
//
//   // Override onSnapshot behaviour for one test:
//   firestore.mocks.onSnapshot.mockImplementationOnce(cb => {
//     cb(firestore.makeSnapshot([
//       { id: 'doc1', data: () => ({ name: 'Aspirin' }) },
//     ]));
//     return jest.fn(); // unsubscribe
//   });
//
//   // Reset between tests:
//   beforeEach(() => jest.clearAllMocks());

// ── Shared mock functions (reset with jest.clearAllMocks) ────────────────────

// Default doc snapshot used by MockDocRef.onSnapshot when no override is set.
const makeDocSnapshot = (exists = false, data = null) => ({
  exists: () => exists,
  data:   () => data,
  // Collection-compatible iteration (no-op for a single-doc snapshot)
  forEach: () => {},
  docs:  [],
  size:  0,
  empty: true,
});

const mockOnSnapshot = jest.fn((cb) => {
  // Default: call back immediately with an empty/non-existent snapshot.
  // Works for both collection listeners (forEach → no items) and document
  // listeners (exists() → false, so callers skip setState).
  cb(makeDocSnapshot(false, null));
  return jest.fn(); // returns unsubscribe fn
});

const mockGet  = jest.fn(() => Promise.resolve(makeSnapshot([])));
const mockUpdate = jest.fn(() => Promise.resolve());
const mockDelete = jest.fn(() => Promise.resolve());
const mockSet    = jest.fn(() => Promise.resolve());
const mockAdd    = jest.fn(() => Promise.resolve({ id: 'mock-new-doc-id' }));
const mockWhere  = jest.fn();

// ── Internal helpers ──────────────────────────────────────────────────────────

function makeSnapshot(docs = []) {
  return {
    forEach: (fn) => docs.forEach(fn),
    docs,
    size: docs.length,
    empty: docs.length === 0,
  };
}

// ── Chainable query builder ───────────────────────────────────────────────────

class MockQuery {
  where(...args) {
    mockWhere(...args);
    return this;
  }
  onSnapshot(cb, errCb) {
    return mockOnSnapshot(cb, errCb);
  }
  get() {
    return mockGet();
  }
}

class MockCollectionRef extends MockQuery {
  doc(id) {
    return new MockDocRef(id);
  }
  add(data) {
    return mockAdd(data);
  }
}

class MockDocRef {
  constructor(id) {
    this.id = id;
  }
  update(data) { return mockUpdate(data); }
  delete()     { return mockDelete(); }
  set(data, options) { return mockSet(data, options); }
  get()        { return mockGet(); }
  onSnapshot(cb, errCb) { return mockOnSnapshot(cb, errCb); }
}

const mockCollection = jest.fn(() => new MockCollectionRef());

// ── Batch writer ──────────────────────────────────────────────────────────────

const mockBatchUpdate = jest.fn();
const mockBatchCommit = jest.fn(() => Promise.resolve());
const mockBatch = jest.fn(() => ({
  update: mockBatchUpdate,
  commit: mockBatchCommit,
}));

// ── Default export: the firestore() factory ───────────────────────────────────

const firestore = jest.fn(() => ({
  collection: mockCollection,
  batch: mockBatch,
}));

// Attach helpers for test access.
firestore.mocks = {
  onSnapshot:   mockOnSnapshot,
  get:          mockGet,
  update:       mockUpdate,
  delete:       mockDelete,
  set:          mockSet,
  add:          mockAdd,
  where:        mockWhere,
  collection:   mockCollection,
  batch:        mockBatch,
  batchUpdate:  mockBatchUpdate,
  batchCommit:  mockBatchCommit,
};

firestore.makeSnapshot = makeSnapshot;

export default firestore;
