import React from "react";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Material from "react-native-vector-icons/MaterialCommunityIcons";

import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import ProfileScreen from "./screens/ProfileScreen";

import MedicineScreen from "./screens/MedicineScreen";
import MediInfoScreen from "./screens/MediInfoScreen";
import NewReminderScreen from "./screens/NewReminder";
import ChangeReminderScreen from "./screens/ChangeReminder";

import DoctorScreen from "./screens/DoctorScreen";
import DoctorInfoScreen from "./screens/DoctorInfoScreen";
import Appointment from "./screens/AppointmentMaker";

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

const DoctorStack = createStackNavigator(
  {
    DoctorScreen: DoctorScreen,
    DoctorInfo: DoctorInfoScreen,
    Appointment: Appointment
  },
  { initialRouteName: "DoctorScreen" }
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
          screen: CalendarScreen,
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
          screen: ProfileScreen,
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
