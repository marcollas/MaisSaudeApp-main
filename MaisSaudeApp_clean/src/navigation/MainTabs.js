import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as VectorIcons from '@expo/vector-icons';

import HomeScreen from '../screens/App/HomeScreen';
import WorkoutsScreen from '../screens/App/WorkoutsScreen';
import SocialScreen from '../screens/App/SocialScreen';
import ProfileScreen from '../screens/App/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let name = 'home';
          if (route.name === 'Home') name = 'home';
          if (route.name === 'Workouts') name = 'dumbbell';
          if (route.name === 'Social') name = 'account-group';
          if (route.name === 'Profile') name = 'account';
          return <VectorIcons.MaterialCommunityIcons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
