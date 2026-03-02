// Manual mock for @react-native-firebase/auth
// Import this in tests, then configure via auth.mocks.*

const mockCurrentUser = {
  uid: 'test-uid-123',
  email: 'patient@example.com',
  emailVerified: true,
  sendEmailVerification: jest.fn(() => Promise.resolve()),
};

const mockSignInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: mockCurrentUser }),
);

const mockCreateUserWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: mockCurrentUser }),
);

const mockSignOut = jest.fn(() => Promise.resolve());

const mockOnAuthStateChanged = jest.fn(cb => {
  cb(mockCurrentUser);
  return jest.fn(); // unsubscribe
});

const mockSendPasswordResetEmail = jest.fn(() => Promise.resolve());

const auth = jest.fn(() => ({
  currentUser: mockCurrentUser,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

// Expose individual mock functions for test assertions / reconfiguration.
auth.mocks = {
  currentUser: mockCurrentUser,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
};

export default auth;
