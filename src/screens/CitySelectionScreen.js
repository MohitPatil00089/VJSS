import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllLocations } from "../component/global";

const CityItem = ({ city, onPress }) => (
  <TouchableOpacity style={styles.cityItem} onPress={onPress}>
    <Text style={styles.cityText}>{city}</Text>
  </TouchableOpacity>
);

const CitySelectionScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCities = async () => {
      try {
        // Always try to fetch fresh data
        const freshCities = await getAllLocations();
        if (freshCities && freshCities.length > 0) {
          setCities(freshCities);

        }
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  const filteredData = cities.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );


  const handleCitySelect = async (city) => {
    try {
      await AsyncStorage.setItem('selectedCity', JSON.stringify({
        name: city.name,
        lat: city.lat,
        long: city.long,
        country_code: city.country_code,
        timezone: city.timezone
      }));
      await AsyncStorage.setItem('selectedCityData', JSON.stringify({
        name: city.name,
        lat: city.lat,
        long: city.long,
        country_code: city.country_code,
        timezone: city.timezone
      }));
      navigation.replace('Home', { city: city.city });
      // Optionally refresh any parent component

    } catch (error) {
      console.error('Error saving city selection:', error);
    }
  };
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading cities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.header.backgroundColor} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <Text style={styles.listHeader}>Cities</Text>
        )}
        renderItem={({ item }) => (
          <CityItem
            city={item.name}
            onPress={() => handleCitySelect(item)}
          />
        )}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9E1B17",
  },
  header: {
    backgroundColor: "transparent",
    height: 50,
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  LoadingText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    color: "white",
  },
  searchContainer: {
    backgroundColor: "#9E1B17",
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  searchInput: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: 16,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF80",
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#9E1B17",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cityItem: {
    backgroundColor: "#9E1B17",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#FFFFFF40",
  },
  cityText: {
    fontSize: 16,
    color: "white",
  },
  list: {
    flex: 1,
    backgroundColor: "#9E1B17",
  }
});

export default CitySelectionScreen;