// Author: Phuoc Hoang Minh Nguyen
// Description: Includes Register, SignIn, ForgotPassword, Terms Screens.
// Status: Optimized

import { createStackNavigator } from "react-navigation-stack"
import LoginScreen from "../screens/AuthStack/LoginScreen"
import RegisterScreen from "../screens/AuthStack/RegisterScreen"
import ForgotPasswordScreen from "../screens/AuthStack/ForgotPasswordScreen"
import Terms from "../screens/AuthStack/Terms"

AuthStack = createStackNavigator(
    {
        LoginScreen,
        RegisterScreen,
        ForgotPasswordScreen,
        Terms
    },
    {
        headerMode: "none"
    }
)

export default AuthStack