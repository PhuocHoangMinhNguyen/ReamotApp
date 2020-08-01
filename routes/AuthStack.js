// Author: Phuoc Hoang Minh Nguyen
// Description: Includes Register and SignIn Screens.
// Status: Optimized

import { createStackNavigator } from "react-navigation-stack"
import LoginScreen from "../screens/AuthStack/LoginScreen"
import RegisterScreen from "../screens/AuthStack/RegisterScreen"

export default AuthStack = createStackNavigator(
    {
        LoginScreen,
        RegisterScreen,
    },
    {
        headerMode: "none"
    }
);