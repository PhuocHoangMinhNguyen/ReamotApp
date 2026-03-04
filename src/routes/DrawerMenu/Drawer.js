// Status: Updated for react-navigation v7

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabs from '../BottomTabs';
import DrawerMenu from './DrawerMenu';

const DrawerNav = createDrawerNavigator();

const DRAWER_STYLE = { width: 250 };

function renderDrawerContent(props) {
  return <DrawerMenu {...props} />;
}

export default function Drawer() {
  return (
    <DrawerNav.Navigator
      id="Drawer"
      screenOptions={{ headerShown: false }}
      drawerPosition="right"
      drawerStyle={DRAWER_STYLE}
      drawerContent={renderDrawerContent}
    >
      <DrawerNav.Screen name="BottomTabs" component={BottomTabs} />
    </DrawerNav.Navigator>
  );
}
