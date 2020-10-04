// Author: Phuoc Hoang Minh Nguyen
// Description: Application Structure, using JS files inside routes.
// Status: Optimized

import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createDrawerNavigator } from "react-navigation-drawer";

import LoadingScreen from "./screens/LoadingScreen";
import VerificationScreen from "./screens/VerificationScreen";
import AuthStack from "./routes/AuthStack";
import BottomTabs from "./routes/BottomTabs";
import DrawerMenu from "./routes/DrawerMenu/DrawerMenu";

import NavigationService from './utilities/NavigationService';

const Drawer = createDrawerNavigator(
  {
    BottomTabs,
  },
  {
    drawerPosition: "right",
    drawerWidth: 250,
    contentComponent: props => <DrawerMenu {...props} />
  }
);

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      App: Drawer,
      AuthStack,
      Verify: VerificationScreen
    },
    {
      initialRouteName: "Loading",
    }
  )
)

class App extends React.Component {
  render() {
    return <AppContainer ref={navigatorRef => {
      NavigationService.setTopLevelNavigator(navigatorRef)
    }} />
  }
}

export default App