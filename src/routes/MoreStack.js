// Author: Phuoc Hoang Minh Nguyen
// Description: Includes EditScreen, ChangePassword, AppointmentList, HelpScreen, TermsOfServices
// Status: Updated for react-navigation v7

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import EditScreen from "../screens/MoreStack/EditScreen";
import HelpScreen from "../screens/MoreStack/HelpScreen";
import TermsOfServices from "../screens/MoreStack/TermsOfServices";
import ChangePassword from "../screens/MoreStack/ChangePassword";
import AppointmentList from "../screens/MoreStack/AppointmentList";

const Stack = createStackNavigator();

export default function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EditScreen" component={EditScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="AppointmentList" component={AppointmentList} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="TermsOfServices" component={TermsOfServices} />
    </Stack.Navigator>
  );
}
