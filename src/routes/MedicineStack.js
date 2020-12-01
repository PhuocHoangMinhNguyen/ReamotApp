// Author: Phuoc Hoang Minh Nguyen
// Description: Includes:
//      - MedicineScreen
//      - MedicineScreen,
//      - MediInfoScreen,
//      - BarcodeScan,
//      - NewReminder,
//      - ChangeReminder,
//      - WeeklyNewReminder,
//      - WeeklyChangeReminder
// Status: Currently using "once reminder" instead of "scheduled reminder" 
//      due to "react-native-alarm-notification" package, version "1.4.6" error.

import { createStackNavigator } from "react-navigation-stack";
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

const MedicineStack = createStackNavigator(
    {
        MedicineScreen,
        AddMedicine,
        MediInfoScreen,
        BarcodeScan,
        NewReminder,
        ChangeReminder,
        WeeklyNewReminder,
        WeeklyChangeReminder
    },
    {
        headerMode: "none"
    }
);

export default MedicineStack