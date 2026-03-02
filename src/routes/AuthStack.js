// Author: Phuoc Hoang Minh Nguyen
// Description: Includes Register, SignIn, ForgotPassword, Terms Screens.
// Status: Updated for react-navigation v7

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/AuthStack/LoginScreen';
import RegisterScreen from '../screens/AuthStack/RegisterScreen';
import ForgotPasswordScreen from '../screens/AuthStack/ForgotPasswordScreen';
import Terms from '../screens/AuthStack/Terms';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="LoginScreen"
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name="Terms" component={Terms} />
    </Stack.Navigator>
  );
}
