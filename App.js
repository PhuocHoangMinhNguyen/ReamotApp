// Author: Phuoc Hoang Minh Nguyen
// Description: Application Structure, using JS files inside routes.
// Status: Optimized

import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";

import LoadingScreen from "./src/screens/LoadingScreen";
import VerificationScreen from "./src/screens/VerificationScreen";
import AuthStack from "./src/routes/AuthStack";
import Drawer from './src/routes/DrawerMenu/Drawer';

import NavigationService from './src/utilities/NavigationService';

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
);

class App extends React.Component {
  render() {
    return (
      <AppContainer ref={navigatorRef => {
        NavigationService.setTopLevelNavigator(navigatorRef);
      }} />
    )
  }
}

export default App