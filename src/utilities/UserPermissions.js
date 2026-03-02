// Author: Phuoc Hoang Minh Nguyen
// Description: Permissions are now handled automatically by react-native-image-picker v7.
// This file is kept for backwards compatibility.
// Status: Updated — expo-permissions removed

class UserPermissions {
  getPhotoPermission = async () => {
    // react-native-image-picker v7+ handles permissions internally on both iOS and Android.
  }
}

export default new UserPermissions()
