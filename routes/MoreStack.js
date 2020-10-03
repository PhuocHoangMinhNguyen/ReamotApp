// Author: Phuoc Hoang Minh Nguyen
// Description: Includes everything in DrawerMenu
// Status: Optimized

import { createStackNavigator } from "react-navigation-stack";
import EditScreen from "../screens/MoreStack/EditScreen";
import HelpScreen from "../screens/MoreStack/HelpScreen";
import TermsOfServices from "../screens/MoreStack/TermsOfServices";
import ChangePassword from "../screens/MoreStack/ChangePassword";
import AppointmentList from "../screens/MoreStack/AppointmentList";

MoreStack = createStackNavigator(
    {
        // Drawer Menu
        EditScreen,
        ChangePassword,
        AppointmentList,
        HelpScreen,
        TermsOfServices,
    },
    {
        headerMode: "none",
    }
)

export default MoreStack