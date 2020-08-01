// Author: Phuoc Hoang Minh Nguyen
// Description: Show user information including avatar, user name, and user email.
// Status: Optimized

import React from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"

export default class ProfileScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {}
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

  render() {
    return (
      <View style={{ marginTop: 30, marginHorizontal: 20 }}>
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
        <Text style={styles.email}>{this.state.user.email}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avatarContainer: {
    shadowColor: "#151734",
    shadowRadius: 30,
    shadowOpacity: 0.4
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50
  },
  name: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "white"
  },
  email: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 15,
    color: "white"
  },
  button: {
    marginVertical: 8,
    marginHorizontal: 16
  }
})