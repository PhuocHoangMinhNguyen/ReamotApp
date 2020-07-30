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

import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Material from "react-native-vector-icons/MaterialCommunityIcons";

import LoadingScreen from "./screens/LoadingScreen";

import LoginScreen from "./screens/AuthStack/LoginScreen";
import RegisterScreen from "./screens/AuthStack/RegisterScreen";

import HomeScreen from "./screens/HomeStack/BackEnd/HomeScreen";

import CalendarScreen from "./screens/CalendarStack/CalendarScreen";

import MedicineScreen from "./screens/MedicineStack/MedicineScreen";
import MediInfoScreen from "./screens/MedicineStack/MediInfoScreen";
import BarcodeScan from "./screens/MedicineStack/BarcodeScan";

// Schedule Reminder
// import NewReminderScreen from "./screens/MedicineStack/ScheduleReminder/NewReminder";
// import ChangeReminderScreen from "./screens/MedicineStack/ScheduleReminder/ChangeReminder";

// Once Reminder
import NewReminderScreen from "./screens/MedicineStack/OnceReminder/NewReminder";
import ChangeReminderScreen from "./screens/MedicineStack/OnceReminder/ChangeReminder";

import DoctorScreen from "./screens/DoctorStack/DoctorScreen";
import AddAccess from "./screens/DoctorStack/AddAccess";
import DoctorInfoScreen from "./screens/DoctorStack/DoctorInfoScreen";
import AccessedDoctorScreen from "./screens/DoctorStack/AccessedDoctorScreen";
import Appointment from "./screens/DoctorStack/AppointmentMaker";

// import ProfileScreen from "./screens/ProfileStack/BackEnd/ProfileScreen";
// import AppointmentList from "./screens/ProfileStack/BackEnd/AppointmentList";
// import EditProfile from "./screens/ProfileStack/BackEnd/EditProfile";

import ProfileScreen from "./screens/ProfileStack/Backup/ProfileScreen";
import AppointmentList from "./screens/ProfileStack/Backup/AppointmentList";

const AuthStack = createStackNavigator({
  Login: LoginScreen,
  Register: RegisterScreen,
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
  },
  { initialRouteName: "Home" }
);

const CalendarStack = createStackNavigator(
  {
    Calendar: CalendarScreen,
  },
  { initialRouteName: "Calendar" }
);

const MedicineStack = createStackNavigator(
  {
    ListMedicine: MedicineScreen,
    MediInfo: MediInfoScreen,
    NewReminder: NewReminderScreen,
    ChangeReminder: ChangeReminderScreen,
    BarcodeScan: BarcodeScan,
  },
  { initialRouteName: "ListMedicine" }
);

const DoctorStack = createStackNavigator(
  {
    DoctorScreen: DoctorScreen,
    AddAccess: AddAccess,
    DoctorInfo: DoctorInfoScreen,
    AccessedDoctorScreen: AccessedDoctorScreen,
    Appointment: Appointment,
  },
  { initialRouteName: "DoctorScreen" }
);

const ProfileStack = createStackNavigator(
  {
    Profile: ProfileScreen,
    AppointList: AppointmentList,
    //Edit: EditProfile,
  },
  { initialRouteName: "Profile" }
);

const AppContainer = createStackNavigator(
  {
    default: createBottomTabNavigator(
      {
        Home: {
          screen: HomeStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Ionicons name="ios-home" size={24} color={tintColor} />
            ),
          },
        },
        Calendar: {
          screen: CalendarStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Ionicons name="ios-calendar" size={24} color={tintColor} />
            ),
          },
        },
        Medicine: {
          screen: MedicineStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Material name="pill" size={24} color={tintColor} />
            ),
          },
        },
        Doctor: {
          screen: DoctorStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Material name="doctor" size={24} color={tintColor} />
            ),
          },
        },
        Profile: {
          screen: ProfileStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Ionicons name="ios-person" size={24} color={tintColor} />
            ),
          },
        },
      },
      {
        defaultNavigationOptions: {
          tabBarOnPress: ({ navigation, defaultHandler }) => {
            defaultHandler();
          },
        },
        tabBarOptions: {
          activeTintColor: "#161F3D",
          inactiveTintColor: "#B8BBC4",
          showLabel: false,
        },
      }
    ),
  },
  {
    mode: "modal",
    headerMode: "none",
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      App: AppContainer,
      Auth: AuthStack,
    },
    {
      initialRouteName: "Loading",
    }
  )
);
