import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router"; // Import useNavigation
import { FontAwesome } from "@expo/vector-icons";

const PetDetails = () => {
  const navigation = useNavigation(); // Initialize navigation
  const {
    petName,
    petGender,
    petAge,
    petWeight,
    petPersonality,
    petDescription,
    petIllnessHistory,
    petVaccinated,
    images,
    username,
    profileImage,
  } = useLocalSearchParams();
  const parsedImages = JSON.parse(images || "[]");

  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleAdopt = () => {
    // Add adoption logic here
    console.log(`${petName} adopted!`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top Image */}
        {parsedImages.length > 0 && (
          <Image source={{ uri: parsedImages[0] }} style={styles.petImage} />
        )}

        {/* Pet Details Container */}
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.petName}>
              {petName}{" "}
              <Text
                style={[
                  styles.petGender,
                  { color: petGender === "Male" ? "#68C2FF" : "#EF5B5B" },
                ]}
              >
                {petGender === "Male" ? "♂" : "♀"}
              </Text>
            </Text>
            <TouchableOpacity onPress={toggleFavorite}>
              <FontAwesome
                name={isFavorited ? "heart" : "heart-o"}
                size={24}
                color="#FF6B6B"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.subText}>{`${petAge} | ${petWeight} Kg`}</Text>
          <Text style={styles.personalityText}>
            {petPersonality
              .split(",")
              .map((trait) => trait.trim())
              .join(" • ")}
          </Text>
          <Text style={styles.description}>{petDescription}</Text>
          <Text style={styles.sectionTitle}>Health History:</Text>
          <View>
            <Text style={styles.bulletText}>
              {petVaccinated === "Yes" ? "• Vaccinated" : "• Not Vaccinated"}
            </Text>
            {petIllnessHistory.split(",").map((illness, index) => (
              <Text key={index} style={styles.bulletText}>
                • {illness.trim()}
              </Text>
            ))}
          </View>
        </View>

        {/* "Posted By" Label */}
        <Text style={styles.postedByLabel}>Posted By:</Text>

        {/* "Posted By" Container */}
        <View style={styles.postedByContainer}>
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.organizationContainer}>
            <Text style={styles.organizationName}>{username}</Text>
          </View>
          <TouchableOpacity style={styles.donateButton}>
            <Text style={styles.donateButtonText}>Donate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Back and Adopt Buttons */}
      <View style={styles.buttonOuterContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()} // Add navigation logic for the Back button
          >
            <FontAwesome name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.adoptButton} onPress={handleAdopt}>
            <Text style={styles.adoptButtonText}>Adopt Me</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#68C2FF",
  },
  scrollContainer: {
    flex: 1,
  },
  petImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4 / 5,
    resizeMode: "cover",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  petGender: {
    fontSize: 24,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  personalityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#68C2FF",
    textAlign: "center",
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  bulletText: {
    fontSize: 16,
    color: "#000",
    marginVertical: 2,
  },
  postedByLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  postedByContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#68C2FF",
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    paddingVertical: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  organizationContainer: {
    flex: 1,
    justifyContent: "center",
  },
  organizationName: {
    fontSize: 16,
    color: "#333",
    flexWrap: "wrap",
    flexShrink: 1,
    maxWidth: "80%",
  },
  donateButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  buttonOuterContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "gray",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  adoptButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    marginLeft: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  adoptButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default PetDetails;
