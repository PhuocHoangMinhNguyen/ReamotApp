// Author: Phuoc Hoang Minh Nguyen
// Description: Responsible for app structure:
//    - AuthStack (StackNavigator): RegisterScreen, LoginScreen
//    - AppContainer:
//      - HomeStack (StackNavigator): HomeScreen
//      - CalendarStack (StackNavigator): CalendarScreen
//      - MedicineStack (StackNavigator):
//        - MedicineScreen,
//        - MediInfoScreen,
//        - NewReminderScreen,
//        - ChangeReminderScreen,
//        - BarcodeScan,
//      - DoctorStack (StackNavigator):
//        - DoctorScreen,
//        - DoctorInfoScreen,
//        - Appointment
//      - ProfileStack (StackNavigator): AppointmentList, ProfileScreen
// Status: In development.

import React from "react"
import { createAppContainer, createSwitchNavigator } from "react-navigation"
import { createDrawerNavigator } from "react-navigation-drawer"

import LoadingScreen from "./screens/LoadingScreen"
import AuthStack from "./routes/AuthStack"
import BottomTabs from "./routes/BottomTabs"
import DrawerMenu from "./routes/DrawerMenu"

const ProfileStack = createDrawerNavigator(
  {
    BottomTabs,
  },
  {
    drawerPosition: "right",
    drawerWidth: 200,
    contentComponent: () => <DrawerMenu />
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      App: ProfileStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: "Loading",
    }
  )
)