// Author: Phuoc Hoang Minh Nguyen
// Description: Application Structure, using JS files inside routes.
// Status: Optimized

import React from "react"
import { createAppContainer, createSwitchNavigator } from "react-navigation"
import { createDrawerNavigator } from "react-navigation-drawer"

import LoadingScreen from "./screens/LoadingScreen"
import AuthStack from "./routes/AuthStack"
import BottomTabs from "./routes/BottomTabs"
import DrawerMenu from "./routes/DrawerMenu/DrawerMenu"

const Drawer = createDrawerNavigator(
  {
    BottomTabs,
  },
  {
    drawerPosition: "right",
    drawerWidth: 200,
    contentComponent: props => <DrawerMenu {...props} />
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      App: Drawer,
      AuthStack,
    },
    {
      initialRouteName: "Loading",
    }
  )
)