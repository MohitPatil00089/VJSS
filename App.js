import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useIconLoader } from './src/utils/IconLoader';

// Import screens
import CitySelectionScreen from './src/screens/CitySelectionScreen';
import Home from './src/screens/Home/Home';
import JainCalendarScreen from './src/screens/JainCalendarScreen';
import PachhakkhanScreen from './src/screens/PachhakkhanScreen';
import SplashScreen from './src/screens/SplashScreen';
import PachhakkhanDetailScreen from './src/screens/PachhakkhanDetailScreen';
import TapAaradhanaScreen from './src/screens/TapAaradhanaScreen';
import TapAradhnaDetailScreen from './src/screens/TapAradhnaDetailScreen';
import KalyanakScreen from './src/screens/KalyanakScreen';
import TirthankarsScreen from './src/screens/TirthankarsScreen';
import FAQScreen from './src/screens/FAQScreen';
import AboutScreen from './src/screens/AboutScreen';
import { StatusBar } from 'react-native';

// Load icons on app start
const IconLoader = () => {
    useIconLoader();
    return null;
};

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />
            <IconLoader />
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="SplashScreen"
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen
                        name="SplashScreen"
                        component={SplashScreen}
                    />
                    <Stack.Screen
                        name="CitySelection"
                        component={CitySelectionScreen}
                    />
                    <Stack.Screen
                        name="Home"
                        component={Home}
                        options={{
                            gestureEnabled: false, // Disable back gesture for Home screen
                        }}
                    />
                    <Stack.Screen
                        name="JainCalendar"
                        component={JainCalendarScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="Pachhakkhan"
                        component={PachhakkhanScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="PachhakkhanDetail"
                        component={PachhakkhanDetailScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="TapAaradhana"
                        component={TapAaradhanaScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="TapAradhnaDetail"
                        component={TapAradhnaDetailScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="Kalyanak"
                        component={KalyanakScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="Tirthankars"
                        component={TirthankarsScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="FAQ"
                        component={FAQScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="About"
                        component={AboutScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

export default App;
