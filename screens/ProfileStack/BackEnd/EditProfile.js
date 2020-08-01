import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import ImagePicker from 'react-native-image-picker';
import Ionicons from "react-native-vector-icons/Ionicons";
import UserPermissions from "../../../utilities/UserPermissions";
import storage from "@react-native-firebase/storage";

function EditProfile({ navigation }) {
  const [user, setUser] = useState([]);
  const [updateName, setName] = useState();
  const [updatePhoneNumber, setPhoneNumber] = useState();
  const [updateAddress, setAddress] = useState();
  const [avatar, setAvatar] = useState();

  useEffect(() => {
    const user = [];
    const subscriber = firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .onSnapshot((documentSnapshot) => {
        setUser(documentSnapshot.data());
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [auth().currentUser.uid]);

  const update = () => {
    if (updateName != null) {
      firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .update({
          name: updateName,
        })
        .then(() => {
          console.log('User updated!');
        }),
        navigation.navigate('ProfileScreen');
    }
    if (updateAddress != null) {
      firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .update({
          Address: updateAddress,
        })
        .then(() => {
          console.log('User updated!');
        }),
        navigation.navigate('ProfileScreen');
    }
    if (updatePhoneNumber != null) {
      firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .update({
          phoneNumber: updatePhoneNumber,
        })
        .then(() => {
          console.log('User updated!');
        }),
        navigation.navigate('ProfileScreen');
    }
    firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .update({
        avatar: user.avatar,
      })
      .then(() => {
        console.log('User updated!');
      }),
      navigation.navigate('ProfileScreen');
  };

  handlePickAvatar = async () => {
    UserPermissions.getPhotoPermission();

    var options = {
      title: "Select Image",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };

    let result = await ImagePicker.showImagePicker(options, (response) => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        const source = response.uri;
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        setUser({ ...this.user, avatar: source });
      }
    });
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <View style={styles.container}>
          <View style={{ marginTop: 64, alignItems: 'center' }}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  user.avatar
                    ? { uri: user.avatar }
                    : require('../../../assets/tempAvatar.jpg')
                }
                style={styles.avatar}
              />
            </View>
            <View>
              <Button
                title="Change avatar"
                onPress={() => handlePickAvatar()}
              />
              <TextInput
                placeholder="name"
                style={styles.input}
                onChangeText={(updateName) => setName(updateName)}
              />
              <TextInput
                placeholder="phone Number"
                style={styles.input}
                onChangeText={(updatePhoneNumber) =>
                  setPhoneNumber(updatePhoneNumber)
                }
              />
              <TextInput
                placeholder="Address (Optional)"
                style={styles.input}
                onChangeText={(updateAddress) => setAddress(updateAddress)}
              />
            </View>
            <View style={styles.button}>
              <Button title="Save profile" onPress={() => update()} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 136,
    height: 136,
    borderRadius: 68,
  },
  button: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    width: 200,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
});

export default EditProfile;
