// Author: Phuoc Hoang Minh Nguyen
// Description: Includes:
//      - DoctorScreen
//      - AddAccess
//      - DoctorInfoScreen,
//      - AccessedDoctorScreen,
//      - AppointmentMaker
// Status: Optimized

import { createStackNavigator } from "react-navigation-stack"
import DoctorScreen from "../screens/DoctorStack/DoctorScreen"
import AddAccess from "../screens/DoctorStack/AddAccess"
import DoctorInfoScreen from "../screens/DoctorStack/DoctorInfoScreen"
import AccessedDoctorScreen from "../screens/DoctorStack/AccessedDoctorScreen"
import AppointmentMaker from "../screens/DoctorStack/AppointmentMaker"

export default DoctorStack = createStackNavigator(
    {
        DoctorScreen,
        AddAccess,
        DoctorInfoScreen,
        AccessedDoctorScreen,
        AppointmentMaker
    },
    {
        headerMode: "none"
    }
);