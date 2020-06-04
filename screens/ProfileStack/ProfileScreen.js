import React from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export default class ProfileScreen extends React.Component {
  state = {
    user: {}
  };

  unsubscribe = null;

  componentDidMount() {
    const user = this.props.uid || (auth().currentUser || {}).uid;

    this.unsubscribe = firestore()
      .collection("users")
      .doc(user)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ marginTop: 64, alignItems: "center" }}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                this.state.user.avatar
                  ? { uri: this.state.user.avatar }
                  : require("../../assets/tempAvatar.jpg")
              }
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{this.state.user.name}</Text>
        </View>
        <Button style={styles.button}
          onPress={() => {
            auth().signOut();
          }}
          title="Log out"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  profile: {
    marginTop: 64,
    alignItems: "center"
  },
  avatarContainer: {
    shadowColor: "#151734",
    shadowRadius: 30,
    shadowOpacity: 0.4
  },
  avatar: {
    width: 136,
    height: 136,
    borderRadius: 68
  },
  name: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24
  },
  button: {
    color: "#018ABE"
  }
});
