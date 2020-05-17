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
import PostScreen from "./screens/PostScreen";
import MedicineScreen from "./screens/MedicineScreen";
import MediInfo from "./screens/MediInfoScreen";
import ProfileScreen from "./screens/ProfileScreen";

// TODO(you): import any additional firebase services that you require for your app, e.g for auth:
//    1) install the npm package: `yarn add @react-native-firebase/auth@alpha` - you do not need to
//       run linking commands - this happens automatically at build time now
//    2) rebuild your app via `yarn run run:android` or `yarn run run:ios`
//    3) import the package here in your JavaScript code: `import '@react-native-firebase/auth';`
//    4) The Firebase Auth service is now available to use here: `firebase.auth().currentUser`

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
        Post: {
          screen: PostScreen,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Ionicons
                name="ios-add-circle"
                size={48}
                color="#E9446A"
                style={{
                  shadowColor: "#E9446A",
                  shadowOffset: { width: 0, height: 10 },
                  shadowRadius: 10,
                  shadowOpacity: 0.3
                }}
              />
            )
          }
        },
        Notification: {
          screen: MedicineScreen,
          navigationOptions: {
            tabBarIcon: ({ tintColor }) => (
              <Material name="pill" size={24} color={tintColor} />
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
            if (navigation.state.key === "Post") {
              navigation.navigate("postModal");
            } else {
              defaultHandler();
            }
          }
        },
        tabBarOptions: {
          activeTintColor: "#161F3D",
          inactiveTintColor: "#B8BBC4",
          showLabel: false
        }
      }
    ),
    postModal: {
      screen: PostScreen
    }
  },
  {
    mode: "modal",
    headerMode: "none"
  }
);

const AuthStack = createStackNavigator({
  Login: LoginScreen,
  Register: RegisterScreen
});

//const MedicineStack = createStackNavigator({
  //MediInfo: MediInfo,
  //Medicine: MedicineScreen
//});

export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      App: AppContainer,
      Auth: AuthStack
      //Medi: MedicineStack
    },
    {
      initialRouteName: "Loading"
    }
  )
);
