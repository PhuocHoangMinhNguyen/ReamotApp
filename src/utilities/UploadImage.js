// Author: Phuoc Hoang Minh Nguyen
// Description: Used to upload images to Firebase Storage
// Status: Optimized

import storage from '@react-native-firebase/storage';

class UploadImage {
  // Upload and replace the avatar in Firebase Storage
  uploadPhotoAsync = async (uri, filename) => {
    const response = await fetch(uri);
    const file = await response.blob();
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
