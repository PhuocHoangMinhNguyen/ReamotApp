import { createStackNavigator } from "react-navigation-stack"
import HomeScreen from "../screens/HomeStack/HomeScreen"
import EditScreen from "../screens/HomeStack/EditScreen"
import HelpScreen from "../screens/HomeStack/HelpScreen"

export default CalendarStack = createStackNavigator(
    {
        HomeScreen,
        EditScreen,
        HelpScreen
    },
    {
        headerMode: "none"
    }
);