// Author: Phuoc Hoang Minh Nguyen
// Description: Includes DoctorScreen, AddAccess, DoctorInfoScreen,
//      AccessedDoctorScreen, AppointmentMaker
// Status: Updated for react-navigation v7

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DoctorScreen from "../screens/DoctorStack/DoctorScreen";
import AddAccess from "../screens/DoctorStack/AddAccess";
import DoctorInfoScreen from "../screens/DoctorStack/DoctorInfoScreen";
import AccessedDoctorScreen from "../screens/DoctorStack/AccessedDoctorScreen";
import AppointmentMaker from "../screens/DoctorStack/AppointmentMaker";

const Stack = createStackNavigator();

export default function DoctorStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DoctorScreen">
            <Stack.Screen name="DoctorScreen" component={DoctorScreen} />
            <Stack.Screen name="AddAccess" component={AddAccess} />
            <Stack.Screen name="DoctorInfoScreen" component={DoctorInfoScreen} />
            <Stack.Screen name="AccessedDoctorScreen" component={AccessedDoctorScreen} />
            <Stack.Screen name="AppointmentMaker" component={AppointmentMaker} />
        </Stack.Navigator>
    );
}
