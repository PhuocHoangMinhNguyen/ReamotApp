// Author: Phuoc Hoang Minh Nguyen
// Description: Includes CalendarScreen only
// Status: Updated for react-navigation v7

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CalendarScreen from '../screens/CalendarStack/CalendarScreen';

const Stack = createStackNavigator();

export default function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
    </Stack.Navigator>
  );
}
