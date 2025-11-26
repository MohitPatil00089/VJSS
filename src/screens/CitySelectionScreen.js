import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";

const CITY_DATA = [
  { id: "1", name: "Adelaide, SA, Australia" },
  { id: "2", name: "Agra, Uttar Pradesh, India" },
  { id: "3", name: "Ahmedabad, Gujarat, India" },
  { id: "4", name: "Aligarh, Uttar Pradesh, India" },
  { id: "5", name: "Allahabad, Uttar Pradesh, India" },
  { id: "6", name: "Amravati, Maharashtra, India" },
  { id: "7", name: "Amritsar, Punjab, India" },
  { id: "8", name: "Anand, Gujarat, India" },
  { id: "9", name: "Ankleshwar, Gujarat, India" },
  { id: "10", name: "Antwerp, Belgium" },
  { id: "11", name: "Atlanta, GA, United States" },
  { id: "12", name: "Aurangabad, Maharashtra, India" },
  { id: "13", name: "Austin, TX, United States" },
];

const CityItem = ({ city, onPress }) => (
  <TouchableOpacity style={styles.cityItem} onPress={onPress}>
    <Text style={styles.cityText}>{city}</Text>
  </TouchableOpacity>
);

const CitySelectionScreen = () => {
  const [searchText, setSearchText] = useState("");

  const filteredData = CITY_DATA.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCitySelect = (cityName) => {
    console.log("Selected City:", cityName);
  };

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
            onPress={() => handleCitySelect(item.name)}
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