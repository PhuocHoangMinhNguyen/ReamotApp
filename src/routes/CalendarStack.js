// Author: Phuoc Hoang Minh Nguyen
// Description: Includes CalendarScreen only
// Status: Optimized

import { createStackNavigator } from "react-navigation-stack";
import CalendarScreen from "../screens/CalendarStack/CalendarScreen";

const CalendarStack = createStackNavigator({
    CalendarScreen,
});

export default CalendarStack