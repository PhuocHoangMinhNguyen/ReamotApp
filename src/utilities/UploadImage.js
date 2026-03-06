// Author: Phuoc Hoang Minh Nguyen
// Description: Used to upload images to Firebase Storage
// Status: Optimized

import storage from '@react-native-firebase/storage';

class UploadImage {
  // Upload and replace the avatar in Firebase Storage
  uploadPhotoAsync = async (uri, filename) => {
    let response;
    try {
      response = await fetch(uri);
    } catch (err) {
      throw new Error('Failed to read image file: ' + err.message);
    }
    let file;
    try {
      file = await response.blob();
    } catch (err) {
      throw new Error('Failed to process image file: ' + err.message);
    }
    const upload = storage().ref(filename).put(file);
    return new Promise((res, rej) => {
      upload.on(
        'state_changed',
        () => {},
        err => rej(err),
        async () => {
          const url = await upload.snapshot.ref.getDownloadURL();
          res(url);
        },
      );
    });
  };
}

export default new UploadImage();
