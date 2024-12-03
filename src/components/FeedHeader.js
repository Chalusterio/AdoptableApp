import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const FeedHeader = () => {
  return (
    <View style={styles.headerContainer}>
      {/* Location Info */}
      <View style={styles.locationContainer}>
        <Icon name="location-on" size={20} color="#EF5B5B" />
        <Text style={styles.locationText}>
          Cagayan De Oro City, Misamis Oriental
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Discover Pets Looking for Homes</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={24} color="#444444" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#C2C2C2"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-list" size={24} color="#444" />
        </TouchableOpacity>
      </View>
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
});

export default FeedHeader;
