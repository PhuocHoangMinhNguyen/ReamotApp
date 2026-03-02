import storage from '@react-native-firebase/storage';
import UploadImage from '../../src/utilities/UploadImage';

// Polyfill fetch + blob in the test environment.
global.fetch = jest.fn(() =>
  Promise.resolve({ blob: () => Promise.resolve(new Blob(['data'])) }),
);

describe('UploadImage.uploadPhotoAsync()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves with the download URL on a successful upload', async () => {
    const EXPECTED_URL = 'https://mock-storage-url.com/file.jpg';
    storage.mocks.getDownloadURL.mockResolvedValueOnce(EXPECTED_URL);

    // The mock `on()` immediately calls the `complete` callback.
    storage.mocks.on.mockImplementationOnce((event, _progress, _error, complete) => {
      complete();
    });

    const url = await UploadImage.uploadPhotoAsync('mock://photo.jpg', 'users/uid/avatar');

    expect(url).toEqual(EXPECTED_URL);
    expect(storage.mocks.ref).toHaveBeenCalledWith('users/uid/avatar');
    expect(storage.mocks.put).toHaveBeenCalled();
  });

  it('rejects when the upload encounters an error', async () => {
    const UPLOAD_ERROR = new Error('Network error');
    storage.mocks.on.mockImplementationOnce((event, _progress, errorCb) => {
      errorCb(UPLOAD_ERROR);
    });

    await expect(
      UploadImage.uploadPhotoAsync('mock://photo.jpg', 'users/uid/avatar'),
    ).rejects.toThrow('Network error');
  });
});
