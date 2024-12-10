import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import PetProvider, { usePets } from "../context/PetContext"; // Import the context
import Feather from "@expo/vector-icons/Feather";

const FeedHeader = ({}) => {
  // State for dropdown and filter options
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedPersonality, setSelectedPersonality] = useState([]);
  const [vaccinated, setVaccinated] = useState(null);
  const [location, setLocation] = useState(null);

  // Animation values
  const slideAnim = useState(new Animated.Value(300))[0]; // Start position is off-screen (300px to the right)

  // Get pet context values
  const { pets, setFilteredPets, applyFilters } = usePets();

  /// Function to fetch the user's current location
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      // Get coordinates
      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);

      // Reverse geocode to get human-readable address
      let address = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (address.length > 0) {
        setLocation({
          city: address[0].city,
          region: address[0].region,
          country: address[0].country,
        });
      }
    };

    getLocation();
  }, []);

  // Debounce search functionality
  useEffect(() => {
    const filterPets = () => {
      if (searchQuery.trim() === "") {
        setFilteredPets(pets);
      } else {
        const filtered = pets.filter(
          (pet) => pet.petName.toLowerCase().includes(searchQuery.toLowerCase()) // Ensure case-insensitivity
        );
        setFilteredPets(filtered);
      }
    };

    const timeoutId = setTimeout(filterPets, 300); // Debounce
    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, [searchQuery, pets, setFilteredPets]);

  // Handle filter button click
  const handleFilterClick = () => {
    setModalVisible(true);

    // Animate the modal sliding in from the right
    Animated.timing(slideAnim, {
      toValue: 0, // End position (visible on screen)
      duration: 300,
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  };

  // Handle modal close
  const closeModal = () => {
    // Animate the modal sliding out to the right
    Animated.timing(slideAnim, {
      toValue: 300, // Start position (off the screen)
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false)); // After the animation completes, hide the modal
  };

  // Apply filters using the context function
  const applyFiltersToPets = () => {
    const filters = {
      gender: selectedGender,
      age: selectedAge,
      weight: selectedWeight,
      personality: selectedPersonality,
      vaccinated: vaccinated,
    };

    applyFilters(filters); // Call applyFilters from context

    // Reset all the filter states after applying the filters
    setSelectedGender(""); // Reset gender filter
    setSelectedAge(""); // Reset age filter
    setSelectedWeight(""); // Reset weight filter
    setSelectedPersonality([]); // Reset personality filter
    setVaccinated(null); // Reset vaccinated filter

    setModalVisible(false); // Close modal after applying filters
  };

  return (
    <PetProvider>
      <View style={styles.headerContainer}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={24}
            color="#444444"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#C2C2C2"
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
          <TouchableOpacity
            onPress={handleFilterClick}
            style={styles.filterButton}
          >
            <Icon name="filter-list" size={24} color="#444" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Discover Pets Looking for Homes</Text>
        </View>

        {/* Location Info */}
        <View style={styles.locationHeader}>
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={20} color="#EF5B5B" />
            <Text style={styles.locationText}>
              {location
                ? `${location.city}, ${location.region}, ${location.country}`
                : "Loading location..."}
            </Text>
          </View>
        </View>

        {/* Modal for Filter Options */}
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateX: slideAnim }] }, // Apply sliding animation
              ]}
            >
              <View style={styles.modalHeaderContainer}>
                <Text style={styles.modalTitle}>Filter Pets</Text>
                <TouchableOpacity
                  style={styles.buttonStyle2}
                  onPress={closeModal}
                >
                  <Feather name="x" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.horizontalLine}></View>

              {/* Gender Filter */}
              <Text style={styles.modalText}>Gender</Text>
              <View style={styles.input2}>
                <Picker
                  selectedValue={selectedGender}
                  onValueChange={(itemValue) => setSelectedGender(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Gender" value="" color="gray" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                </Picker>
              </View>

              {/* Other Filters (Age, Weight, Personality, Vaccinated) */}
              <Text style={styles.modalText}>Age (years)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Age"
                placeholderTextColor={"gray"}
                fontFamily={"Lato"}
                keyboardType="numeric"
                value={selectedAge}
                onChangeText={(text) => setSelectedAge(text)}
              />

              <Text style={styles.modalText}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Weight"
                placeholderTextColor={"gray"}
                fontFamily={"Lato"}
                keyboardType="numeric"
                value={selectedWeight}
                onChangeText={(text) => setSelectedWeight(text)}
              />

              <Text style={styles.modalText}>Personality</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Personality Traits"
                placeholderTextColor={"gray"}
                fontFamily={"Lato"}
                value={selectedPersonality.join(", ")}
                onChangeText={(text) =>
                  setSelectedPersonality(
                    text.split(",").map((item) => item.trim())
                  )
                }
              />

              <Text style={styles.modalText}>Vaccinated</Text>
              <View style={styles.input2}>
                <Picker
                  selectedValue={vaccinated}
                  onValueChange={(itemValue) => setVaccinated(itemValue)}
                  style={[styles.picker, { fontFamily: "Lato" }]}
                >
                  <Picker.Item
                    label="Select Vaccinated Status"
                    value={null}
                    color="gray"
                    style={{ fontFamily: "Lato" }}
                  />
                  <Picker.Item
                    label="Yes"
                    value={true}
                    style={{ fontFamily: "Lato" }}
                  />
                  <Picker.Item
                    label="No"
                    value={false}
                    style={{ fontFamily: "Lato" }}
                  />
                </Picker>
              </View>

              {/* Apply and Close Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={applyFiltersToPets}
                >
                  <Text style={styles.buttonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </PetProvider>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    padding: 20,
    paddingTop: 0,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 10,
  },
  locationHeader: {
    width: "100%",
    paddingLeft: -10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    fontSize: 16,
    fontFamily: "Lato",
    marginLeft: 3,
    color: "#C2C2C2",
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Lilita",
    color: "#68C2FF",
    marginTop: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-end", // Center the search bar
    width: "88%", // Adjust the width of the search bar to 90% of its parent container
    marginTop: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#444",
    paddingHorizontal: 10,
  },
  filterButton: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim the background
    justifyContent: "flex-start",
    alignItems: "flex-end", // Align the modal to the right
  },
  modalContainer: {
    width: "70%", // Width of the modal
    height: "100%", // Full height
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },
  modalHeaderContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: "Lilita",
    color: "#68C2FF",
    marginTop: 5,
  },
  buttonStyle2: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EF5B5B",
  },
  modalText: {
    fontFamily: "LatoBold",
    marginVertical: 10,
  },
  horizontalLine: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "gray",
    alignSelf: "center",
  },
  input2: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 6,
    marginVertical: 10,
    fontSize: 14,
    justifyContent: "center",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 14,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 6,
    paddingLeft: 20,
    marginVertical: 10,
    fontSize: 14,
    justifyContent: "center",
  },
  buttonContainer: {
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    marginTop: 20,
  },
  buttonStyle: {
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    width: "50%",
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "white",
    height: 50,
    backgroundColor: "#68C2FF",
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontFamily: "LatoBold",
    fontSize: 16,
  },
});

export default FeedHeader;
