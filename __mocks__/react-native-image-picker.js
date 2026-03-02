// Manual mock for react-native-image-picker

export const launchImageLibrary = jest.fn(() =>
  Promise.resolve({
    didCancel:  false,
    errorCode:  null,
    assets:     [{ uri: 'mock://photo.jpg' }],
  }),
);

export const launchCamera = jest.fn(() =>
  Promise.resolve({
    didCancel: false,
    errorCode: null,
    assets:    [{ uri: 'mock://camera.jpg' }],
  }),
);
