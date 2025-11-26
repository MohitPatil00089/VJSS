import React from "react";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./src/screens/SplashScreen";
import CitySelectionScreen from "./src/screens/CitySelectionScreen";

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="CitySelection" component={CitySelectionScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;