// Author: Phuoc Hoang Minh Nguyen & Quang Duy Nguyen
// Description: Allow patient to edit their profile.
// Status: Need to:
//    - Implement ScrollView
//    - Edit User's information in Firebase Authentication

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView
} from 'react-native';

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import UploadImage from '../../utilities/UploadImage';

import ImagePicker from 'react-native-image-picker';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import UserPermissions from "../../utilities/UserPermissions";
import Toast from "react-native-simple-toast";

var background = require('../../assets/background.png')
var tempAvatar = require("../../assets/tempAvatar.jpg")

class EditScreen extends React.Component {
  state = {
    user: {
      avatar: null,
      name: "",
      phoneNumber: "",
      address: ""
    }
  }

  unsubscribe = null

  componentDidMount() {
    const user = this.props.uid || (auth().currentUser || {}).uid

    this.unsubscribe = firestore().collection("users").doc(user)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() });
      })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  // To Pick Avatar from library or take a photo and set it as avatar.
  handlePickAvatar = async () => {
    UserPermissions.getPhotoPermission()

    var options = {
      title: "Select Image",
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    }

    let result = await ImagePicker.showImagePicker(options, (response) => {
      console.log("Response = ", response)

      if (response.didCancel) {
        console.log("User cancelled image picker")
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error)
      } else {
        const source = response.uri
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          user: { ...this.state.user, avatar: source }
        })
      }
    })
  }

  // Edit User's information in Firestore.
  editProfile = async () => {
    const { name, phoneNumber, address, avatar } = this.state.user
    let remoteUri = null
    let db = firestore().collection("users").doc((auth().currentUser || {}).uid)
    db.update({
      avatar: null,
      name: name,
      phoneNumber: phoneNumber,
      address: address,
    })
    if (avatar) {
      // Store the avatar in Firebase Storage
      remoteUri = await UploadImage.uploadPhotoAsync(
        avatar,
        `users/${(auth().currentUser || {}).uid}`
      );
      // Then Store the avatar in Cloud Firestore
      db.set({ avatar: remoteUri }, { merge: true })
    }
    Toast.show("Your Account Details is editted !")
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.containter}
          source={background}
        />
        <Text style={styles.header}>Edit Profile</Text>
        <TouchableOpacity style={styles.opacity}
          onPress={this.handlePickAvatar}>
          <Image style={styles.avatar}
            source={
              this.state.user.avatar
                ? { uri: this.state.user.avatar }
                : tempAvatar
            } />
          <MaterialIcons
            name="photo-camera"
            size={35}
            color="black"
            style={styles.icon}
          />
        </TouchableOpacity>
        <ScrollView>
          <Text style={styles.name}>{this.state.user.name}</Text>
          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}>Full Name</Text>
              <TextInput style={styles.input}
                onChangeText={name =>
                  this.setState({ user: { ...this.state.user, name } })
                }
                value={this.state.user.name}
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={styles.inputTitle}>Contact Number</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={phoneNumber =>
                  this.setState({ user: { ...this.state.user, phoneNumber } })
                }
                value={this.state.user.phoneNumber}
              />
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={styles.inputTitle}>Address</Text>
              <TextInput
                style={styles.input}
                onChangeText={address =>
                  this.setState({ user: { ...this.state.user, address } })
                }
                value={this.state.user.address}
              />
            </View>
          </View>
          <TouchableOpacity onPress={this.editProfile}>
            <View style={styles.button}>
              <Text style={{ color: "#FFF" }}>Save profile</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  containter: {
    width: Dimensions.get("window").width, //for full screen
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  header: {
    alignSelf: "center",
    color: "#FFF",
    fontSize: 20,
    marginTop: -160,
    marginBottom: 40,
  },
  opacity: {
    alignSelf: "flex-start",
    marginLeft: 40,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    alignSelf: "flex-end",
    marginEnd: 30,
    //marginTop: -30,
    fontSize: 20,
    color: "#000000",
  },
  form: {
    marginHorizontal: 30,
    marginVertical: 24,
  },
  inputTitle: {
    color: "#8A8F9E",
    fontSize: 10,
    textTransform: "uppercase",
  },
  input: {
    borderBottomColor: "#8A8F9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 40,
    fontSize: 15,
    color: "#161F3D",
  },
  button: {
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 100,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    marginHorizontal: 30,
  },
  icon: {
    position: "absolute",
    top: 110,
    left: 110,
    width: 35,
    height: 35,
    backgroundColor: "white",
    borderRadius: 15,
  },
})

export default EditScreen
