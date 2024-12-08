import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions, // Import Dimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons"; // Import Foundation icons

const screenWidth = Dimensions.get("window").width;

const PetDetails = () => {
  const router = useRouter(); // Initialize navigation
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
  const [currentIndex, setCurrentIndex] = useState(0); // Track current image index

  const scrollViewRef = useRef(null); // ScrollView reference

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleAdopt = () => {
    // Add adoption logic here
    console.log(`${petName} adopted!`);
  };

  const onScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const imageWidth = Dimensions.get("window").width; // Use screen width for calculations
    const index = Math.round(contentOffsetX / imageWidth); // Use Math.round for accurate snapping
    setCurrentIndex(index); // Update the current index state
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Horizontal Image Scroll */}
        {parsedImages.length > 0 && (
          <View>
            <ScrollView
              horizontal={true}
              style={styles.imageScrollContainer}
              ref={scrollViewRef}
              onScroll={onScroll}
              scrollEventThrottle={16} // For smooth scroll tracking
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
            >
              <View style={styles.petImageContainer}>
                {parsedImages.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.petImage}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {parsedImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.activeDot, // Highlight the active dot
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Pet Details Container */}
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.petName}>
              {petName}
              {"   "}
              <Text
                style={[
                  styles.petGender,
                  {
                    color: petGender === "Male" ? "#68C2FF" : "#EF5B5B",
                  },
                ]}
              >
                {petGender === "Male" ? (
                  <Foundation name="male-symbol" size={24} color="#68C2FF" />
                ) : (
                  <Foundation name="female-symbol" size={24} color="#EF5B5B" />
                )}
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
          <Text style={styles.subText}>{`${petAge} | ${petWeight}`}</Text>
          <Text style={styles.personalityText}>
            {petPersonality
              .split(",")
              .map((trait) => trait.trim())
              .join("     ●     ")}
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
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
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
            onPress={() => router.back()} // Add navigation logic for the Back button
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
  imageScrollContainer: {},
  petImageContainer: {
    flexDirection: "row", // Arrange images horizontally
  },
  petImage: {
    width: screenWidth, // Set each image to the width of the screen
    height: 500, // Maintain the height or adjust as needed
    resizeMode: "cover", // Ensure the image scales correctly
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    margin: 4,
  },
  activeDot: {
    backgroundColor: "#68C2FF", // Active dot color
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginTop: 30,
    margin: 20,
    padding: 30,
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
    fontFamily: "Lilita",
    color: "#333",
  },
  petGender: {
    fontSize: 24,
  },
  subText: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#666",
    marginTop: 4,
  },
  personalityText: {
    fontSize: 16,
    fontFamily: "Lilita",
    color: "#68C2FF",
    textAlign: "center",
    marginVertical: 30,
  },
  description: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "LatoBold",
    color: "#333",
    marginTop: 30,
  },
  bulletText: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#000",
    marginVertical: 2,
  },
  postedByLabel: {
    fontSize: 16,
    fontFamily: "LatoBold",
    color: "white",
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
    borderColor: "white",
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
