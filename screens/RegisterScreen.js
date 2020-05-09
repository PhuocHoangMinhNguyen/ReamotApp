import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export default class RegisterScreen extends React.Component {
  static navigationOptions = {
    headerShown: false
  };

  state = {
    user: {
      name: "",
      email: "",
      password: ""
    },
    errorMessage: null
  };

  handleSignUp = () => {
    auth()
      .createUserWithEmailAndPassword(
        this.state.user.email,
        this.state.user.password
      )
      .catch(error => this.setState({ errorMessage: error.message }));

    firestore()
      .collection("users")
      .add({
        name: this.state.user.name,
        email: this.state.user.email
      })
      .then(() => {
        console.log("User added!");
      });
  };

  handlePickAvatar = () => {};

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Image
          source={require("../assets/authHeader.png")}
          style={{ marginTop: -180, marginLeft: -50 }}
        />
        <Image
          source={require("../assets/authFooter.png")}
          style={{ position: "absolute", bottom: -325, right: -225 }}
        />
        <TouchableOpacity
          style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="ios-arrow-round-back" size={32} color="#FFF" />
        </TouchableOpacity>
        <View
          style={{
            position: "absolute",
            top: 24,
            alignItems: "center",
            width: "100%"
          }}
        >
          <Text style={styles.greeting}>
            {"Hello!\nSign up to get started."}
          </Text>
          <TouchableOpacity
            style={styles.avatarPlaceholder}
            onPress={this.handlePickAvatar}
          >
            <Image
              source={{ uri: this.state.user.avatar }}
              style={styles.avatar}
            />
            <Ionicons
              name="ios-add"
              size={40}
              color="#FFF"
              style={{ marginTop: 6, marginLeft: 2 }}
            />
          </TouchableOpacity>

          <View style={styles.errorMessage}>
            {this.state.errorMessage && (
              <Text style={styles.error}>{this.state.errorMessage}</Text>
            )}
          </View>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.inputTitle}>Full Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={name =>
                this.setState({ user: { ...this.state.user, name } })
              }
              value={this.state.user.name}
            />
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.inputTitle}>Email Address</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              onChangeText={email =>
                this.setState({ user: { ...this.state.user, email } })
              }
              value={this.state.user.email}
            />
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.inputTitle}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              onChangeText={password =>
                this.setState({ user: { ...this.state.user, password } })
              }
              value={this.state.user.password}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
          <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignSelf: "center", marginTop: 24 }}
          onPress={() => this.props.navigation.navigate("Login")}
        >
          <Text style={{ color: "#414959", fontSize: 13 }}>
            Already have an account?
            <Text style={{ fontWeight: "500", color: "#E9446A" }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  greeting: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color: "#FFF"
  },
  form: {
    marginTop: 60,
    marginBottom: 24,
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
    backgroundColor: "#E9446A",
    borderRadius: 4,
    height: 52,
    alignItems: "center",
    justifyContent: "center"
  },
  errorMessage: {
    marginTop: 12,
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
  back: {
    position: "absolute",
    top: 24,
    left: 32,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(21, 22, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E1E2E6",
    borderRadius: 50,
    marginTop: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  avatar: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50
  }
});
