import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import FeedHeader from "../../components/FeedHeader"; // Import your Header component
import { useNavigation } from "@react-navigation/native"; // For navigation
import { Foundation } from '@expo/vector-icons'; // Import Foundation icons

const Feed = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation(); // Hook for navigation

  // Parse the selectedImages string back into an array
  const selectedImages = params.selectedImages
    ? JSON.parse(params.selectedImages)
    : [];

  // Simulating data for pet cards, combining multiple images into one pet card
  const pets = [
    {
      id: "1", // Single pet card
      petName: params.petName || "Pet 1",
      petGender: params.petGender || "Unknown",
      petAge: params.petAge || "Unknown",
      images: selectedImages, // Store all images in the "images" property
    },
  ];

  // Render pet item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        // Navigate to PetDetails page, passing all images for this pet
        navigation.navigate("PetDetails", {
          petId: item.id,
          images: item.images,
        });
      }}
    >
      {/* Render only the first image initially */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images[0] }} // Show only the first image
          style={styles.image}
        />
      </View>
      <View style={styles.petDetailsContainer}>
        <View style={styles.nameGenderContainer}>
          <Text style={styles.name}>{item.petName}</Text>

          {/* Conditional rendering for gender icon */}
          <View style={styles.genderContainer}>
            {item.petGender === "female" ? (
              <Foundation name="female-symbol" size={24} color="#EF5B5B" />
            ) : item.petGender === "male" ? (
              <Foundation name="male-symbol" size={24} color="#68C2FF" />
            ) : (
              <Text style={styles.gender}>Unknown</Text>
            )}
          </View>
        </View>
        <Text style={styles.age}>{item.petAge}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FeedHeader />
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2} // Display two cards per row
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between", // Evenly distribute the cards within a row
    marginBottom: 16,
  },
  card: {
    width: "48%", // Each card occupies 48% of the row width
    marginBottom: 16, // Spacing between rows
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 230,
    elevation: 3, // For Android shadow
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow images to wrap into new rows
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 20, // Top-left corner radius
    borderTopRightRadius: 20, // Top-right corner radius
    borderBottomLeftRadius: 0, // Bottom-left corner radius
    borderBottomRightRadius: 0, // Bottom-right corner radius
  },
  petDetailsContainer: {
    flex: 1,
    margin: 13,
    alignItems: "center",
  },
  nameGenderContainer: {
    flexDirection: "row", // Make name and gender appear on the same line
    alignItems: "center", // Vertically align the text and icon
    marginBottom: 5, // Optional spacing between name and gender
  },
  name: {
    fontSize: 16,
    fontFamily: "LatoBold",
    color: "black",
    marginRight: 8, // Adds spacing between name and gender icon
  },
  genderContainer: {
    flexDirection: "row", // Arrange the icon and text in a row
    alignItems: "center", // Center the icon vertically
  },
  gender: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#C2C2C2",
  },
  age: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#C2C2C2",
  },
});

export default Feed;
