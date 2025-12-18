import React from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';
import AppStack from './src/navigation/AppStack';
import { AuthProvider } from './src/contexts/AuthContext';
import { HealthProvider } from './src/contexts/HealthContext';
import { WorkoutsProvider } from './src/contexts/WorkoutsContext';
import { ProfileProvider } from './src/contexts/ProfileContext';

enableScreens();

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<AuthProvider>
			<ProfileProvider>
				<HealthProvider>
					<WorkoutsProvider>
						<NavigationContainer>
							<Stack.Navigator screenOptions={{ headerShown: false }}>
								<Stack.Screen name="Login" component={LoginScreen} />
								<Stack.Screen name="Register" component={RegisterScreen} />
								<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
								<Stack.Screen name="MainApp" component={AppStack} />
							</Stack.Navigator>
						</NavigationContainer>
					</WorkoutsProvider>
				</HealthProvider>
			</ProfileProvider>
		</AuthProvider>
	);
}