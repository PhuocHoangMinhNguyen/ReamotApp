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
//import ShowCalendar from "./screens/CalendarStack/ShowCalendar";

import MedicineScreen from "./screens/MedicineStack/MedicineScreen";
import MediInfoScreen from "./screens/MedicineStack/MediInfoScreen";

// React Native Alarm Notification
//import NewReminderScreen from "./screens/MedicineStack/ReactNativeAlarmNotification/NewReminder";
//import ChangeReminderScreen from "./screens/MedicineStack/ReactNativePushNotification/ChangeReminder";

// React Native Push Notification
import NewReminderScreen from "./screens/MedicineStack/ReactNativePushNotification/NewReminder";
import ChangeReminderScreen from "./screens/MedicineStack/ReactNativePushNotification/ChangeReminder";

import DoctorScreen from "./screens/DoctorStack/DoctorScreen";
import DoctorInfoScreen from "./screens/DoctorStack/DoctorInfoScreen";
import Appointment from "./screens/DoctorStack/AppointmentMaker";

import ProfileScreen from "./screens/ProfileStack/BackEnd/ProfileScreen";
import AppointmentList from "./screens/ProfileStack/BackEnd/AppointmentList";

// TODO(you): import any additional firebase services that you require for your app, e.g for auth:
//    1) install the npm package: `yarn add @react-native-firebase/auth@alpha` - you do not need to
//       run linking commands - this happens automatically at build time now
//    2) rebuild your app via `yarn run run:android` or `yarn run run:ios`
//    3) import the package here in your JavaScript code: `import '@react-native-firebase/auth';`
//    4) The Firebase Auth service is now available to use here: `firebase.auth().currentUser`

const AuthStack = createStackNavigator({
  Login: LoginScreen,
  Register: RegisterScreen
});

const MedicineStack = createStackNavigator(
  {
    ListMedicine: MedicineScreen,
    MediInfo: MediInfoScreen,
    NewReminder: NewReminderScreen,
    ChangeReminder: ChangeReminderScreen
  },
  { initialRouteName: "ListMedicine" }
);

const CalendarStack = createStackNavigator(
  {
    Calendar: CalendarScreen,
    //ShowCalendar: ShowCalendar
  },
  { initialRouteName: "Calendar" }
)

const DoctorStack = createStackNavigator(
  {
    DoctorScreen: DoctorScreen,
    DoctorInfo: DoctorInfoScreen,
    Appointment: Appointment
  },
  { initialRouteName: "DoctorScreen" }
)

const ProfileStack = createStackNavigator(
  {
    Profile: ProfileScreen,
    AppointList: AppointmentList
  },
  { initialRouteName: "Profile" }
)

const AppContainer = createStackNavigator(
  {
    default: createBottomTabNavigator(
      {
        Home: {
          screen: HomeScreen,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Ionicons name="ios-home" size={24} color={tintColor} />
            )
          }
        },
        Calendar: {
          screen: CalendarStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Ionicons name="ios-calendar" size={24} color={tintColor} />
            )
          }
        },
        Medicine: {
          screen: MedicineStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Material name="pill" size={24} color={tintColor} />
            )
          }
        },
        Doctor: {
          screen: DoctorStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Material
                name="doctor"
                size={24}
                color={tintColor}
              />
            )
          }
        },
        Profile: {
          screen: ProfileStack,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Ionicons name="ios-person" size={24} color={tintColor} />
            )
          }
        }
      },
      {
        defaultNavigationOptions: {
          tabBarOnPress: ({ navigation, defaultHandler }) => {
            defaultHandler();
          }
        },
        tabBarOptions: {
          activeTintColor: "#161F3D",
          inactiveTintColor: "#B8BBC4",
          showLabel: false
        }
      }
    ),
  },
  {
    mode: "modal",
    headerMode: "none"
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      App: AppContainer,
      Auth: AuthStack
    },
    {
      initialRouteName: "Loading"
    }
  )
);
