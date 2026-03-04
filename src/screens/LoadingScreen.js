// Author: Phuoc Hoang Minh Nguyen
// Description:
// This file decides if when launching, the app state goes to Authentication Stack, or App Stack
// based on user's state (null or not null)
// Status: Optimized

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

class LoadingScreen extends React.Component {
  unsubscribe = null;

  componentDidMount() {
    this.unsubscribe = auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(
        user ? (user.emailVerified ? 'App' : 'Verify') : 'AuthStack',
      );
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;
