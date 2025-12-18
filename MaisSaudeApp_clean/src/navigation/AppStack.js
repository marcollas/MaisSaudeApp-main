import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import EditProfileScreen from '../screens/App/EditProfileScreen';
import CreatePostScreen from '../screens/App/CreatePostScreen';
import ActivityTrackerScreen from '../screens/App/ActivityTrackerScreen';
import RoutesHistoryScreen from '../screens/App/RoutesHistoryScreen';
import RouteDetailScreen from '../screens/App/RouteDetailScreen';
import WorkoutTrackerScreen from '../screens/App/WorkoutTrackerScreen';
import WorkoutSessionScreen from '../screens/App/WorkoutSessionScreen';
import StrengthWorkoutScreen from '../screens/App/StrengthWorkoutScreen';
import WorkoutDetailsScreen from '../screens/App/WorkoutDetailsScreen';
import ExerciseSearchScreen from '../screens/App/ExerciseSearchScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="ActivityTracker" component={ActivityTrackerScreen} />
      <Stack.Screen name="RoutesHistory" component={RoutesHistoryScreen} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
      <Stack.Screen name="WorkoutTracker" component={WorkoutTrackerScreen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
      <Stack.Screen name="StrengthWorkout" component={StrengthWorkoutScreen} />
      <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
      <Stack.Screen name="ExerciseSearch" component={ExerciseSearchScreen} />
    </Stack.Navigator>
  );
}
