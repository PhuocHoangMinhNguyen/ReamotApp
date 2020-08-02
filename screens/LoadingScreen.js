// Author: Phuoc Hoang Minh Nguyen
//
// Description: 
// This file decides if when launching, the app state goes to Authentication Stack, or App Stack
// based on user's state (null or not null)
//
// Status: Optimized

import React from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import auth from "@react-native-firebase/auth"

export default class LoadingScreen extends React.Component {
  componentDidMount() {
    auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? (user.emailVerified ? "App" : "Verify") : "AuthStack")
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
})