import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Location from "expo-location";

const FeedHeader = () => {
  const [location, setLocation] = useState("Fetching location...");
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterByLocation, setFilterByLocation] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(300)); // Start off-screen

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied.");
          setLocation("Location unavailable.");
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;

        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (address) {
          setLocation(
            `${address.city || address.region}, ${
              address.subregion || address.country
            }`
          );
        } else {
          setLocation("Location unavailable.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching location.");
        setLocation("Location unavailable.");
      }
    };

    fetchLocation();
  }, []);

  const toggleFilter = () => setFilterByLocation(!filterByLocation);

  const handleSeeResults = () => {
    closeDrawer();
  };

  const openDrawer = () => {
    setModalVisible(true);
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 300, // Off-screen
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => setModalVisible(false));
  };

  return (
    <View style={styles.headerContainer}>
      {/* Location Info */}
      <View style={styles.locationContainer}>
        <Icon name="location-on" size={20} color="#EF5B5B" />
        <Text style={styles.locationText}>{location}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Discover Pets Looking for Homes</Text>

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
        />
        <TouchableOpacity style={styles.filterButton} onPress={openDrawer}>
          <Icon name="filter-list" size={24} color="#444" />
        </TouchableOpacity>
      </View>

      {/* Drawer Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          {/* Animated Drawer */}
          <Animated.View
            style={[
              styles.drawerContent,
              { transform: [{ translateX: drawerAnimation }] },
            ]}
          >
            <Text style={styles.modalTitle}>Filter Pets</Text>

            {/* Filter by Location */}
            <TouchableOpacity
              style={styles.filterOption}
              onPress={toggleFilter}
            >
              <Icon
                name={
                  filterByLocation ? "check-box" : "check-box-outline-blank"
                }
                size={24}
                color="black"
              />
              <Text style={styles.filterText}>Filter by my location</Text>
            </TouchableOpacity>

            {/* See Results Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleSeeResults}
            >
              <Text style={styles.buttonText}>See Results</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    fontFamily: "Lato",
    marginLeft: 10,
    color: "#C2C2C2",
  },
  title: {
    fontSize: 26,
    fontFamily: "Lilita",
    color: "#68C2FF",
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawerContent: {
    position: "absolute",
    right: 0,
    width: 300,
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    color: '#68C2FF',
    fontFamily: 'Lilita',
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  filterText: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Lato',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#68C2FF",
    padding: 10,
    height: 40,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: "#fff",
    fontFamily: 'Lato',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FeedHeader;
