// Author: Phuoc Hoang Minh Nguyen
// Description: Includes HomeScreen and MedicationInformation
// Status: Updated for react-navigation v7

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeStack/HomeScreen";
import MedicationInformation from "../screens/HomeStack/MedicationInformation";

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="HomeScreen"
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="MedicationInformation"
        component={MedicationInformation}
      />
    </Stack.Navigator>
  );
}
