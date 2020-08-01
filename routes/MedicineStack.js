import { createStackNavigator } from "react-navigation-stack"
import MedicineScreen from "../screens/MedicineStack/MedicineScreen";
import MediInfoScreen from "../screens/MedicineStack/MediInfoScreen";
import BarcodeScan from "../screens/MedicineStack/BarcodeScan";

// Once Reminder
import NewReminderScreen from "../screens/MedicineStack/OnceReminder/NewReminder";
import ChangeReminderScreen from "../screens/MedicineStack/OnceReminder/ChangeReminder";

// Schedule Reminder
// import NewReminderScreen from "../screens/MedicineStack/ScheduleReminder/NewReminder";
// import ChangeReminderScreen from "../screens/MedicineStack/ScheduleReminder/ChangeReminder";

export default MedicineStack = createStackNavigator(
    {
        MedicineScreen,
        MediInfoScreen,
        BarcodeScan,
        NewReminderScreen,
        ChangeReminderScreen,
    },
    {
        headerMode: "none"
    });