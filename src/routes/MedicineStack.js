// Author: Phuoc Hoang Minh Nguyen
// Description: Includes MedicineScreen, MediInfoScreen, BarcodeScan,
//      NewReminder, ChangeReminder, WeeklyNewReminder, WeeklyChangeReminder
// Status: Updated for react-navigation v7

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MedicineScreen from "../screens/MedicineStack/MedicineScreen";
import AddMedicine from "../screens/MedicineStack/AddMedicine";
import MediInfoScreen from "../screens/MedicineStack/MediInfoScreen";
import BarcodeScan from "../screens/MedicineStack/BarcodeScan";

// Daily Reminder
import NewReminder from "../screens/MedicineStack/DailyReminder/NewReminder";
import ChangeReminder from "../screens/MedicineStack/DailyReminder/ChangeReminder";

// Weekly Reminder
import WeeklyNewReminder from "../screens/MedicineStack/WeeklyReminder/WeeklyNewReminder";
import WeeklyChangeReminder from "../screens/MedicineStack/WeeklyReminder/WeeklyChangeReminder";

const Stack = createStackNavigator();

export default function MedicineStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MedicineScreen">
            <Stack.Screen name="MedicineScreen" component={MedicineScreen} />
            <Stack.Screen name="AddMedicine" component={AddMedicine} />
            <Stack.Screen name="MediInfoScreen" component={MediInfoScreen} />
            <Stack.Screen name="BarcodeScan" component={BarcodeScan} />
            <Stack.Screen name="NewReminder" component={NewReminder} />
            <Stack.Screen name="ChangeReminder" component={ChangeReminder} />
            <Stack.Screen name="WeeklyNewReminder" component={WeeklyNewReminder} />
            <Stack.Screen name="WeeklyChangeReminder" component={WeeklyChangeReminder} />
        </Stack.Navigator>
    );
}
