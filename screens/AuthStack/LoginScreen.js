// Author: Phuoc Hoang Minh Nguyen
// Description: Sign In Screen
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
import Toast from "react-native-simple-toast";
import Ionicons from "react-native-vector-icons/Ionicons";
import UserReminders from '../../utilities/UserReminders';
import Background from '../../components/Background';

var logoTest = require("../../assets/images/logoTest.png");

class LoginScreen extends React.Component {
  state = {
    user: {
      email: "",
      password: "",
    },
    errorMessage: null,
    showPassword: false
  }

  // Handle Show, Hide Password
  handlePassword = () => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  // Handle Login using email and password.
  handleLogin = () => {
    const { email, password } = this.state.user
    // Solve the problem when there is space in the end of email by mistake
    const emailTrim = email.trim();

    if (emailTrim == "") {
      Toast.show("Please Enter Email Information", Toast.LONG);
    } else if (password == "") {
      Toast.show("Please Enter Password", Toast.LONG);
    } else {
      auth().signInWithEmailAndPassword(emailTrim, password)
        .catch(error => this.setState({ errorMessage: error.message }))
        .then(() => {
          if (auth().currentUser) UserReminders.setReminders(emailTrim)
        });
    }
  }

  render() {
    const { errorMessage, showPassword } = this.state
    const { email, password } = this.state.user
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF" }}>
        <Background />
        <Image source={logoTest} style={styles.logoTest} />
        <ScrollView>
          <View style={styles.errorMessage}>
            {errorMessage && (
              <Text style={styles.error}>{errorMessage}</Text>
            )}
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}>Email Address</Text>
              <TextInput style={styles.input}
                autoCapitalize="none"
                onChangeText={email => this.setState({ user: { ...this.state.user, email } })}
                value={email} />
            </View>

            <View style={{ marginTop: 32 }}>
              <Text style={styles.inputTitle}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.password}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onChangeText={password => this.setState({ user: { ...this.state.user, password } })}
                  value={password}
                />
                <TouchableOpacity onPress={this.handlePassword}>
                  {showPassword == true
                    ? <Ionicons name="ios-eye" size={24} />
                    : <Ionicons name="ios-eye-off" size={24} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: "center", marginVertical: 24 }}
            onPress={() => this.props.navigation.navigate("ForgotPasswordScreen")}>
            <Text style={{ textDecorationLine: "underline" }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignSelf: "center" }}
            onPress={() => this.props.navigation.navigate("RegisterScreen")}
          >
            <Text style={{ color: "#414959", fontSize: 13 }}>
              New to SocialApp?{' '}
              <Text style={{ fontWeight: '500', color: '#018ABE' }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  logoTest: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    marginTop: -180
  },
  form: {
    marginBottom: 32,
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
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    marginHorizontal: 30
  },
  errorMessage: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
    marginBottom: 12
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
});

export default LoginScreen