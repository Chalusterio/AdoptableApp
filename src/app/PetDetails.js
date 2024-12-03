import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native"; // To access passed params

const PetDetails = () => {
  const route = useRoute();
  const { petId, images } = route.params; // Retrieve params passed from Feed page

  return (
    <ScrollView style={styles.safeArea}>
      <Text style={styles.title}>Pet Details</Text>
      <Text style={styles.subtitle}>Pet ID: {petId}</Text>

      <View style={styles.imageContainer}>
        {images.map((uri, index) => (
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
