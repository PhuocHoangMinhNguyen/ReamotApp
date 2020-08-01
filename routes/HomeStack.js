import { createStackNavigator } from "react-navigation-stack"
import HomeScreen from "../screens/HomeStack/HomeScreen"
import EditScreen from "../screens/HomeStack/EditScreen"
import HelpScreen from "../screens/HomeStack/HelpScreen"
import MedicationInformation from "../screens/HomeStack/MedicationInformation"

export default CalendarStack = createStackNavigator(
    {
        EditScreen,
        HelpScreen,
        HomeScreen,
        MedicationInformation
    },
    {
        headerMode: "none",
        initialRouteName: "HomeScreen",
    }
);