import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";

const SplashScreen = ({ navigation }) => {

  const slideAnim = useRef(new Animated.Value(80)).current; 

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace("CitySelection");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.mantra}>
        || Shree Shankheshwar Parsvanathay Namah ||
      </Text>

      <Animated.View 
        style={{
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Image
          source={require("../assets/iphone15.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.bottomText}>
        Jain Shwetambar Sangh{"\n"}Sydney
      </Text>

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

  mantra: {
    position: "absolute",
    top: "20%",
    color: "white",
    fontSize: 18,
    fontFamily: "sans-serif-light",
    textAlign: "center",
  },

  logo: {
    width: 250,
    height: 150,
    marginBottom: 20,
  },

  bottomText: {
    position: "absolute",
    bottom: "20%",
    color: "white",
    fontSize: 22,
    textAlign: "center",
    fontFamily: "sans-serif",
  },
});

export default SplashScreen;
