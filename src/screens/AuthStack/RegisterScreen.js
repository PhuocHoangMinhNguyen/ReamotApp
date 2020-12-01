// Author: Phuoc Hoang Minh Nguyen
// Description: Register Screen
// Status: Optimized

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import UploadImage from '../../utilities/UploadImage';
import Ionicons from "react-native-vector-icons/Ionicons";
import ImagePicker from "react-native-image-picker";
import UserPermissions from "../../utilities/UserPermissions";
import Toast from "react-native-simple-toast";
import CheckBox from "@react-native-community/checkbox";
import Background from '../../components/Background';

class RegisterScreen extends React.Component {
  state = {
    user: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      avatar: null
    },
    errorMessage: null,
    showPassword: false,
    toggleCheckBox: false,
  }

  // To Show or Hide Password
  handlePassword = () => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  // Check if all information is entered before create a new user.
  handleSignUp = () => {
    const { name, email, password, phoneNumber } = this.state.user
    if (name.trim == "") {
      Toast.show("Please Enter Full Name", Toast.LONG);
    } else if (email.trim == "") {
      Toast.show("Please Enter Email Information", Toast.LONG);
    } else if (password == "") {
      Toast.show("Please Enter A Password", Toast.LONG);
    } else if (phoneNumber == "") {
      Toast.show("Please Enter Contact Number", Toast.LONG);
    } else if (this.state.toggleCheckBox == false) {
      Toast.show("Please Agree to Terms of Services", Toast.LONG);
    } else {
      this.createUser(this.state.user);
    }
  }

  // create a new user in Firebase Authentication with email and password, 
  // then store the information in Firestore,
  createUser = async user => {
    let remoteUri = null
    try {
      await auth().createUserWithEmailAndPassword(user.email.trim(), user.password)
        .catch(error => this.setState({ errorMessage: error.message }));

      await auth().currentUser.sendEmailVerification();

      // If there is no error.
      if (this.state.errorMessage == null) {
        let db = firestore().collection("users").doc((auth().currentUser || {}).uid);

        db.set({
          name: user.name.trim(),
          email: user.email.trim(),
          phoneNumber: user.phoneNumber,
          avatar: null,
          doctorList: null,
          pharmacistList: null
        });

        // If the user choose an avatar,
        if (user.avatar) {
          // Store the avatar in Firebase Storage
          remoteUri = await UploadImage.uploadPhotoAsync(
            user.avatar,
            `users/${(auth().currentUser || {}).uid}`
          );
          // Then Store the avatar in Cloud Firestore
          db.set({ avatar: remoteUri }, { merge: true });
        }
      }
    } catch (error) { }
  }

  // To Pick Avatar from library or take a photo and set it as avatar.
  handlePickAvatar = async () => {
    UserPermissions.getPhotoPermission();

    var options = {
      title: "Select Image",
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    }

    let result = await ImagePicker.showImagePicker(options, (response) => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        const source = response.uri
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          user: { ...this.state.user, avatar: source }
        });
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Background />
        <TouchableOpacity style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={32} color="#FFF" />
        </TouchableOpacity>
        <View style={{ alignItems: "center", width: "100%", marginTop: -200 }} >
          <Text style={styles.greeting}>
            {"Hello to Reamot!\nSign up to get started."}
          </Text>
          <TouchableOpacity style={styles.avatarPlaceholder}
            onPress={this.handlePickAvatar}
          >
            <Image source={{ uri: this.state.user.avatar }}
              style={styles.avatar} />
            <Ionicons name="ios-add"
              size={40}
              color="#FFF" />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.errorMessage}>
            {this.state.errorMessage && (
              <Text style={styles.error}>{this.state.errorMessage}</Text>
            )}
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}>Full Name</Text>
              <TextInput style={styles.input}
                onChangeText={name => this.setState({ user: { ...this.state.user, name } })}
                value={this.state.user.name} />
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputTitle}>Email Address</Text>
              <TextInput style={styles.input}
                autoCapitalize="none"
                onChangeText={email => this.setState({ user: { ...this.state.user, email } })}
                value={this.state.user.email} />
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputTitle}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.password}
                  secureTextEntry={!this.state.showPassword}
                  autoCapitalize="none"
                  onChangeText={password => this.setState({ user: { ...this.state.user, password } })}
                  value={this.state.user.password}
                />
                <TouchableOpacity onPress={this.handlePassword}>
                  {this.state.showPassword == true
                    ? <Ionicons name="ios-eye" size={24} />
                    : <Ionicons name="ios-eye-off" size={24} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputTitle}>Contact Number</Text>
              <TextInput style={styles.input}
                keyboardType="numeric"
                onChangeText={phoneNumber => this.setState({ user: { ...this.state.user, phoneNumber } })}
                value={this.state.user.phoneNumber} />
            </View>
          </View>

          <View style={styles.termsOfServicesContainer}>
            <CheckBox
              value={this.state.toggleCheckBox}
              onValueChange={newValue => this.setState({ toggleCheckBox: newValue })}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-evenly", flex: 1 }}>
              <Text>I agree to Reamot</Text>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Terms")}>
                <Text style={styles.termsOfServices}>Terms of Services</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
            <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignSelf: "center", marginTop: 12 }}
            onPress={() => this.props.navigation.navigate("LoginScreen")}
          >
            <Text style={{ color: "#414959", fontSize: 13 }}>
              Already have an account?
            <Text style={{ fontWeight: "500", color: "#018ABE" }}> Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  greeting: {
    marginTop: 25,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color: "#FFF"
  },
  form: {
    marginHorizontal: 30
  },
  inputTitle: {
    color: "#8A8F9E",
    fontSize: 10,
    textTransform: "uppercase"
  },
  input: {
    borderBottomColor: "#8A8F9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 40,
    fontSize: 15,
    color: "#161F3D"
  },
  password: {
    height: 40,
    fontSize: 15,
    color: "#161F3D",
    flex: 1
  },
  passwordContainer: {
    flexDirection: "row",
    borderBottomColor: "#8A8F9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    marginHorizontal: 30
  },
  errorMessage: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
  },
  error: {
    color: "#E9446A",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  },
  back: {
    position: "absolute",
    top: 24,
    left: 30,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(21, 22, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E1E2E6",
    borderRadius: 50,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  avatar: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50
  },
  termsOfServicesContainer: {
    marginVertical: 12,
    marginHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  termsOfServices: {
    textDecorationLine: "underline"
  }
});

export default RegisterScreen