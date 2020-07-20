// Author: Phuoc Hoang Minh Nguyen
// Description: Sign In Screen
// Status: Optimized

import React from "react"
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  LayoutAnimation,
  ImageBackground,
  ScrollView
} from "react-native"
import auth from "@react-native-firebase/auth"
import Toast from "react-native-simple-toast"
import Ionicons from "react-native-vector-icons/Ionicons"

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    headerShown: false
  }

  state = {
    email: "",
    password: "",
    errorMessage: null,
    showPassword: false
  }

  handlePassword = () => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  handleLogin = () => {
    const { password } = this.state
    // Solve the problem when there is space in the end of email by mistake
    const email = this.state.email.trim()

    if (email == "") {
      Toast.show("Please Enter Email Information", Toast.LONG)
    } else if (password == "") {
      Toast.show("Please Enter Password", Toast.LONG)
    } else {
      auth()
        .signInWithEmailAndPassword(email, password)
        .catch(error => this.setState({ errorMessage: error.message }))
    }
  }

  render() {
    // This pass is for show, hide password icon.
    const showPass = <Ionicons name="ios-eye" size={24} />
    const hidePass = <Ionicons name="ios-eye-off" size={24} />
    let message
    if (this.state.showPassword == false) {
      message = hidePass
    } else {
      message = showPass
    }
    LayoutAnimation.easeInEaseOut()
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={require("../../assets/logoTest.png")}
          style={{
            marginTop: 30,
            alignSelf: 'center',
            width: 200,
            height: 200,
            marginLeft: 10
          }}
        />
        <ScrollView>
          <StatusBar barStyle="light-content" />
          <View style={styles.errorMessage}>
            {this.state.errorMessage && (
              <Text style={styles.error}>{this.state.errorMessage}</Text>
            )}
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}>Email Address</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
              />
            </View>

            <View style={{ marginTop: 32 }}>
              <Text style={styles.inputTitle}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.password}
                  secureTextEntry={!this.state.showPassword}
                  autoCapitalize="none"
                  onChangeText={password => this.setState({ password })}
                  value={this.state.password}
                />
                <TouchableOpacity onPress={this.handlePassword}>
                  {message}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignSelf: "center", marginTop: 32 }}
            onPress={() => this.props.navigation.navigate("Register")}
          >
            <Text style={{ color: "#414959", fontSize: 13 }}>
              New to SocialApp?{' '}
              <Text style={{ fontWeight: '500', color: '#018ABE' }}>
                Sign up
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <ImageBackground
          style={[styles.fixed, styles.containter, { zIndex: -1 }]}
          source={require("../../assets/registerBackground.png")}
        />
      </View >
    );
  }
}

const styles = StyleSheet.create({
  containter: {
    width: Dimensions.get("window").width, //for full screen
    height: Dimensions.get("window").height //for full screen
  },
  fixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  form: {
    marginBottom: 48,
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
  button: {
    marginHorizontal: 30,
    backgroundColor: "#018ABE",
    borderRadius: 4,
    height: 52,
    alignItems: "center",
    justifyContent: "center"
  },
  errorMessage: {
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30
  },
  error: {
    color: "#E9446A",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
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
})