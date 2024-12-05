import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router"; // To access passed params

const PetDetails = () => {
  const {
    petName,
    petGender,
    petAge,
    petWeight,
    petPersonality,
    petDescription,
    petIllnessHistory,
    petVaccinated,
    adoptionFee,
    images,
  } = useLocalSearchParams(); // Retrieve params
  const parsedImages = JSON.parse(images || "[]"); // Parse the images string

  return (
    <ScrollView style={styles.safeArea}>
      <Text style={styles.title}>Pet Details</Text>
      <Text style={styles.subtitle}>Name: {petName}</Text>
      <Text style={styles.subtitle}>Gender: {petGender}</Text>
      <Text style={styles.subtitle}>Age: {petAge}</Text>
      <Text style={styles.subtitle}>Weight: {petWeight}</Text>
      <Text style={styles.subtitle}>Personality: {petPersonality}</Text>
      <Text style={styles.subtitle}>Description: {petDescription}</Text>
      <Text style={styles.subtitle}>Illness History: {petIllnessHistory}</Text>
      <Text style={styles.subtitle}>Vaccinated: {petVaccinated}</Text>
      <Text style={styles.subtitle}>Adoption Fee: {adoptionFee}</Text>

      <View style={styles.imageContainer}>
        {parsedImages.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.image} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    margin: 10,
  },
});

export default PetDetails;
