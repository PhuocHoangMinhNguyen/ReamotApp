// Author: Phuoc Hoang Minh Nguyen
// Description: Used as a backup plan for HomeStack
// Status: In development

import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Home Screen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
})