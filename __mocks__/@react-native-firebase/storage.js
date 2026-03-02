// Manual mock for @react-native-firebase/storage

const mockGetDownloadURL = jest.fn(() => Promise.resolve('https://mock-storage-url.com/file.jpg'));

const mockOn = jest.fn((event, progressCb, errorCb, completeCb) => {
  if (completeCb) completeCb();
});

const mockUploadTask = {
  on:       mockOn,
  snapshot: { ref: { getDownloadURL: mockGetDownloadURL } },
};

const mockPut  = jest.fn(() => mockUploadTask);
const mockRef  = jest.fn(() => ({ put: mockPut }));

const storage = jest.fn(() => ({
  ref: mockRef,
}));

storage.mocks = {
  ref:            mockRef,
  put:            mockPut,
  on:             mockOn,
  getDownloadURL: mockGetDownloadURL,
};

export default storage;
