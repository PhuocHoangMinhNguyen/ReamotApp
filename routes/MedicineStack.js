// Author: Phuoc Hoang Minh Nguyen
// Description: Includes:
//      - MedicineScreen
//      - MedicineScreen,
//      - MediInfoScreen,
//      - BarcodeScan,
//      - NewReminder,
//      - ChangeReminder,
// Status: Currently using "once reminder" instead of "scheduled reminder" 
//      due to "react-native-alarm-notification" package error.

import { createStackNavigator } from "react-navigation-stack"
import MedicineScreen from "../screens/MedicineStack/MedicineScreen";
import MediInfoScreen from "../screens/MedicineStack/MediInfoScreen";
import BarcodeScan from "../screens/MedicineStack/BarcodeScan";

// Daily Reminder
import NewReminder from "../screens/MedicineStack/DailyReminder/NewReminder";
import ChangeReminder from "../screens/MedicineStack/DailyReminder/ChangeReminder";

// Weekly Reminder
// import NewReminder from "../screens/MedicineStack/WeeklyReminder/NewReminder";
// import ChangeReminder from "../screens/MedicineStack/WeeklyReminder/ChangeReminder";

export default MedicineStack = createStackNavigator(
    {
        MedicineScreen,
        MediInfoScreen,
        BarcodeScan,
        NewReminder,
        ChangeReminder,
    },
    {
        headerMode: "none"
    });