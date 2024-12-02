import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

const Feed = () => {
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log("Received parameters:", params);
  }, [params]);

  // Safely parse selectedImages
  let selectedImages = [];
  try {
    if (params.selectedImages) {
      selectedImages = JSON.parse(params.selectedImages); // Parse the serialized string
    }
  } catch (error) {
    console.error("Error parsing selectedImages:", error);
  }
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.detailContainer}>
        {/* Display pet details */}
        <Text style={styles.label}>Pet Name:</Text>
        <Text style={styles.value}>{params.petName || "N/A"}</Text>

        <Text style={styles.label}>Pet Gender:</Text>
        <Text style={styles.value}>{params.petGender || "N/A"}</Text>

        <Text style={styles.label}>Pet Age:</Text>
        <Text style={styles.value}>{params.petAge || "N/A"}</Text>

        <Text style={styles.label}>Pet Weight:</Text>
        <Text style={styles.value}>{params.petWeight || "N/A"}</Text>

        <Text style={styles.label}>Pet Personality:</Text>
        <Text style={styles.value}>{params.petPersonality || "N/A"}</Text>

        <Text style={styles.label}>Pet Description:</Text>
        <Text style={styles.value}>{params.petDescription || "N/A"}</Text>

        <Text style={styles.label}>Pet Illness History:</Text>
        <Text style={styles.value}>{params.petIllnessHistory || "N/A"}</Text>

        <Text style={styles.label}>Vaccinated:</Text>
        <Text style={styles.value}>{params.petVaccinated || "N/A"}</Text>
      </View>

      {/* Display selected images */}
      <Text style={styles.imageSectionTitle}>Selected Images:</Text>
      <ScrollView horizontal style={styles.imageContainer}>
        {selectedImages.length > 0 ? (
          selectedImages.map((imageUri, index) => (
            <Image key={index} source={{ uri: imageUri }} style={styles.image} />
          ))
        ) : (
          <Text style={styles.noImagesText}>No images selected</Text>
        )}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  detailContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
    color: "#555",
  },
  imageSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  imageContainer: {
    flexDirection: "row",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  noImagesText: {
    fontSize: 16,
    color: "#999",
  },
});

export default Feed;
