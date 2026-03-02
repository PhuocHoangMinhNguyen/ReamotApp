// Status: Updated for react-navigation v7

import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import BottomTabs from "../BottomTabs";
import DrawerMenu from "./DrawerMenu";

const DrawerNav = createDrawerNavigator();

export default function Drawer() {
  return (
    <DrawerNav.Navigator
      id="Drawer"
      screenOptions={{ headerShown: false }}
      drawerPosition="right"
      drawerStyle={{ width: 250 }}
      drawerContent={(props) => <DrawerMenu {...props} />}
    >
      <DrawerNav.Screen name="BottomTabs" component={BottomTabs} />
    </DrawerNav.Navigator>
  );
}
