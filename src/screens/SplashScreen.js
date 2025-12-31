import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {

  const slideAnim = useRef(new Animated.Value(80)).current;
  const alertShownRef = useRef(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    let navigateTimer;

    const onAgree = async () => {
      try {
        const savedCityStr = await AsyncStorage.getItem('selectedCity');
        const savedCity = savedCityStr ? JSON.parse(savedCityStr) : null;
        if (savedCity) {
          navigation.replace('Home', { city: savedCity?.city });
        } else {

          navigation.replace('CitySelection');

        }
      } catch (e) {
        navigation.replace('CitySelection');
      }
    };

    const disclaimerMessage =
      'The contents of this Application are very sacred as it contains Photos of Arihant Bhagwan and Religious Literature. So we request you to use respectfully and avoid Ashatana.\n\nAll calculations are generated based on Longitude and Latitude. There may be minor difference in Pachhakana timings.';

    const showDisclaimer = () => {
      if (alertShownRef.current) return;
      alertShownRef.current = true;
      Alert.alert(
        'Disclaimer',
        disclaimerMessage,
        [
          { text: 'Agree', onPress: onAgree },
        ],
        { cancelable: false }
      );
    };

    const alertTimer = setTimeout(showDisclaimer, 300);

    return () => {
      if (navigateTimer) clearTimeout(navigateTimer);
      clearTimeout(alertTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/landing.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9E1B17",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
