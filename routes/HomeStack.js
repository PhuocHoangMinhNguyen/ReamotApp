// Author: Phuoc Hoang Minh Nguyen
// Description: Includes HomeScreen and everything in DrawerMenu
// Status: Optimized

import { createStackNavigator } from "react-navigation-stack"
import HomeScreen from "../screens/HomeStack/HomeScreen"
import EditScreen from "../screens/HomeStack/EditScreen"
import HelpScreen from "../screens/HomeStack/HelpScreen"
import TermsOfServices from "../screens/HomeStack/TermsOfServices"
import ChangePassword from "../screens/HomeStack/ChangePassword"
import MedicationInformation from "../screens/HomeStack/MedicationInformation"

export default CalendarStack = createStackNavigator(
    {
        // Drawer Menu
        EditScreen,
        ChangePassword,
        HelpScreen,
        TermsOfServices,

        // HomeStack
        HomeScreen,
        MedicationInformation
    },
    {
        headerMode: "none",
        initialRouteName: "HomeScreen",
    }
);