import { PermissionsAndroid, Platform } from "react-native";
import * as Permissions from "expo-permissions";

class UserPermissions {
  getPhotoPermission = async () => {
    if (Platform.OS === "ios") {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (status !== "granted") {
        alert(
          "We need permission to use your camera roll if you'd like to incude a photo."
        );
      }
    }

    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
    }
  };
}

export default new UserPermissions();
