// Author: Phuoc Hoang Minh Nguyen
// Description: Used to upload images to Firebase Storage
// Status: Optimized

import storage from "@react-native-firebase/storage";

class UploadImage {
    // Upload and replace the avatar in Firebase Storage
    uploadPhotoAsync = (uri, filename) => {
        return new Promise(async (res, rej) => {
            const response = await fetch(uri)
            const file = await response.blob()

            let upload = storage().ref(filename).put(file);

            upload.on("state_changed", snapshot => { },
                err => { rej(err) },
                async () => {
                    const url = await upload.snapshot.ref.getDownloadURL()
                    res(url)
                }
            )
        })
    }
}

export default new UploadImage()