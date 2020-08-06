// Author: Phuoc Hoang Minh Nguyen
// Description: Includes HomeScreen and everything in DrawerMenu
// Status: Optimized

import { createStackNavigator } from "react-navigation-stack"
import HomeScreen from "../screens/HomeStack/HomeScreen"
import MedicationInformation from "../screens/HomeStack/MedicationInformation"

export default HomeStack = createStackNavigator(
    {
        // HomeStack
        HomeScreen,
        MedicationInformation
    },
    {
        headerMode: "none",
        initialRouteName: "HomeScreen",
    }
);