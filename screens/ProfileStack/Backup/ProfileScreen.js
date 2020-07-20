// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make appointment to the doctor or pharmacist of their chosen.
// Status: In development

import React from "react"
import { View, Text, StyleSheet, Button, Image } from "react-native"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      user: {}
    }
  }

  unsubscribe = null

  componentDidMount() {
    const user = this.props.uid || (auth().currentUser || {}).uid

    this.unsubscribe = firestore()
      .collection("users")
      .doc(user)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() });
      })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  handlePress = () => {
    this.props.navigation.navigate("AppointList")
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
                  : require("../../../assets/tempAvatar.jpg")
              }
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{this.state.user.name}</Text>
        </View>
        <View style={styles.button}>
          <Button
            onPress={this.handlePress}
            title="Appointment List"
          />
        </View>
        <View style={styles.button}>
          <Button
            onPress={() => {
              auth().signOut()
            }}
            title="Log out"
          />
        </View>
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
    marginVertical: 8,
    marginHorizontal: 16
  }
})