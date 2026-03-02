// Author: Phuoc Hoang Minh Nguyen
// Description: Application entry point. Auth state drives which navigator renders.
// Status: Updated for react-navigation v7

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";

import AuthStack from "./src/routes/AuthStack";
import Drawer from './src/routes/DrawerMenu/Drawer';
import VerificationScreen from "./src/screens/VerificationScreen";
import { navigationRef } from "./src/utilities/NavigationService";

class App extends React.Component {
  state = {
    user: null,
    initializing: true,
  };

  componentDidMount() {
    this.unsubscribe = auth().onAuthStateChanged(user => {
      this.setState({ user, initializing: false });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { user, initializing } = this.state;

    if (initializing) {
      return (
        <View style={styles.loading}>
          <Text>Loading...</Text>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!user) {
      return (
        <NavigationContainer>
          <AuthStack />
        </NavigationContainer>
      );
    }

    if (!user.emailVerified) {
      return <VerificationScreen />;
    }

    return (
      <NavigationContainer ref={navigationRef}>
        <Drawer />
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
