import { createStackNavigator } from "react-navigation-stack"
import HomeScreen from "../screens/HomeStack/BackEnd/HomeScreen"
import ProfileScreen from "../screens/HomeStack/Backup/ProfileScreen"

export default CalendarStack = createStackNavigator(
    {
        HomeScreen,
        ProfileScreen
    },
    {
        headerMode: "none"
    }
);