import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useIconLoader } from './src/utils/IconLoader';

import {
    StatusBar,
    Alert,
    Platform,
    PermissionsAndroid,
    AppState,
} from 'react-native';

import notifee, { AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import CitySelectionScreen from './src/screens/CitySelectionScreen';
import Home from './src/screens/Home/Home';
import JainCalendarScreen from './src/screens/JainCalendarScreen';
import TithisInMonth from './src/screens/TithisInMonth';
import PachhakkhanScreen from './src/screens/PachhakkhanScreen';
import SplashScreen from './src/screens/SplashScreen';
import PachhakkhanDetailScreen from './src/screens/PachhakkhanDetailScreen';
import TapAaradhanaScreen from './src/screens/TapAaradhanaScreen';
import TapAradhnaDetailScreen from './src/screens/TapAradhnaDetailScreen';
import KalyanakScreen from './src/screens/KalyanakScreen';
import TirthankarsScreen from './src/screens/TirthankarsScreen';
import FAQScreen from './src/screens/FAQScreen';
import AboutScreen from './src/screens/AboutScreen';
import NotificationScreen from './src/screens/NotificationScreen';

/* ================================
   🔔 BACKGROUND NOTIFICATION HANDLER
   ================================ */
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);

    await notifee.displayNotification({
        title: remoteMessage?.notification?.title ?? 'Notification',
        body: remoteMessage?.notification?.body ?? 'You have a new message.',
        android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
        },
    });
});

/* ================================
   🔹 ICON LOADER
   ================================ */
const IconLoader = () => {
    useIconLoader();
    return null;
};

const Stack = createNativeStackNavigator();

const handleAppStateChange = state => {
    console.log('App state:', state);
};

const App = () => {

    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            handleAppStateChange
        );

        const initialize = async () => {
            /* 🔐 Android 13+ permission */
            if (Platform.OS === 'android') {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
            }

            /* 🔔 Create notification channel */
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                importance: AndroidImportance.HIGH,
            });

            /* 🔑 Firebase permission */
            await messaging().requestPermission();

            /* 📱 FCM Token */
            const token = await messaging().getToken();
            await AsyncStorage.setItem('deviceToken', token);
            console.log('FCM Token:', token);

            /* 🔔 FOREGROUND NOTIFICATION */
            const unsubscribe = messaging().onMessage(async remoteMessage => {

                const title =
                    remoteMessage?.notification?.title ?? 'Notification';

                const body =
                    remoteMessage?.notification?.body ??
                    'You have a new message.';

                if (Platform.OS === 'android') {
                    await notifee.displayNotification({
                        title,
                        body,
                        android: {
                            channelId: 'default',
                            importance: AndroidImportance.HIGH,
                        },
                    });
                } else {
                    Alert.alert(title, body);
                }
            });

            /* 🔁 Notification opened from background */
            messaging().onNotificationOpenedApp(remoteMessage => {
                console.log('Opened from background:', remoteMessage);
            });

            /* 🚀 Notification opened from quit state */
            const initialNotification =
                await messaging().getInitialNotification();

            if (initialNotification) {
                console.log(
                    'Opened from quit:',
                    initialNotification.notification
                );
            }

            return unsubscribe;
        };

        let unsubscribeFn;

        initialize().then(fn => {
            unsubscribeFn = fn;
        });

        return () => {
            subscription.remove();
            if (unsubscribeFn) unsubscribeFn();
        };
    }, []);

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
                    <Stack.Screen name="SplashScreen" component={SplashScreen} />
                    <Stack.Screen name="CitySelection" component={CitySelectionScreen} />
                    <Stack.Screen
                        name="Home"
                        component={Home}
                        options={{ gestureEnabled: false }}
                    />
                    <Stack.Screen name="JainCalendar" component={JainCalendarScreen} />
                    <Stack.Screen name="tithisInMonth" component={TithisInMonth} />
                    <Stack.Screen name="Pachhakkhan" component={PachhakkhanScreen} />
                    <Stack.Screen name="PachhakkhanDetail" component={PachhakkhanDetailScreen} />
                    <Stack.Screen name="TapAaradhana" component={TapAaradhanaScreen} />
                    <Stack.Screen name="TapAradhnaDetail" component={TapAradhnaDetailScreen} />
                    <Stack.Screen name="Kalyanak" component={KalyanakScreen} />
                    <Stack.Screen name="Tirthankars" component={TirthankarsScreen} />
                    <Stack.Screen name="Notification" component={NotificationScreen} />
                    <Stack.Screen name="FAQ" component={FAQScreen} />
                    <Stack.Screen name="About" component={AboutScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

export default App;

