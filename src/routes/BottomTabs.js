// Author: Phuoc Hoang Minh Nguyen
// Description: Application BottomTabNavigator with 5 tabs.
//  The Profile tab opens the right-side drawer instead of navigating.
// Status: Updated for react-navigation v7

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from '@react-native-vector-icons/ionicons';
import Material from '@react-native-vector-icons/material-design-icons';

import HomeStack from './HomeStack';
import CalendarStack from './CalendarStack';
import MedicineStack from './MedicineStack';
import DoctorStack from './DoctorStack';
import MoreStack from './MoreStack';

const Tab = createBottomTabNavigator();

const HomeTabIcon = ({ color }) => (
  <Ionicons name="home" size={24} color={color} />
);
const CalendarTabIcon = ({ color }) => (
  <Ionicons name="calendar" size={24} color={color} />
);
const MedicineTabIcon = ({ color }) => (
  <Material name="pill" size={24} color={color} />
);
const DoctorTabIcon = ({ color }) => (
  <Material name="doctor" size={24} color={color} />
);
const ProfileTabIcon = ({ color }) => (
  <Ionicons name="reorder-three" size={24} color={color} />
);

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#161F3D',
        tabBarInactiveTintColor: '#B8BBC4',
        lazy: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarIcon: HomeTabIcon }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{ tabBarIcon: CalendarTabIcon }}
      />
      <Tab.Screen
        name="Medicine"
        component={MedicineStack}
        options={{ tabBarIcon: MedicineTabIcon }}
      />
      <Tab.Screen
        name="Doctor"
        component={DoctorStack}
        options={{ tabBarIcon: DoctorTabIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={MoreStack}
        options={{ tabBarIcon: ProfileTabIcon }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.getParent('Drawer')?.openDrawer();
          },
        })}
      />
    </Tab.Navigator>
  );
}
