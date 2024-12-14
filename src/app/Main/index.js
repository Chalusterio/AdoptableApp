import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router"; // Import useRouter
import FeedHeader from "../../components/FeedHeader"; // Import your Header component
import SideBar from "../../components/SideBar";
import { usePets } from "../../context/PetContext"; // Adjust the path as needed
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../../../firebase"; // Ensure `auth` and `db` are imported from Firebase

const Feed = () => {
  const params = useLocalSearchParams();
  const { pets } = usePets(); // Access shared pets state
  const router = useRouter(); // For navigation
  const { filteredPets, setFilteredPets } = usePets(); // Added
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedItem, setSelectedItem] = useState("Main");

  // Parse the selectedImages string back into an array
  const selectedImages = params.selectedImages
    ? JSON.parse(params.selectedImages)
    : [];

  // Validate if required parameters are present
  const isPetDataValid =
    params.petName &&
    params.petGender &&
    params.petAge &&
    params.petWeight &&
    params.petPersonality &&
    params.petDescription &&
    params.petIllnessHistory &&
    typeof params.petVaccinated !== "undefined" &&
    selectedImages.length > 0;

  // State to track favorited pets by their IDs
  const [favoritedPets, setFavoritedPets] = useState({});
  const [userFavorites, setUserFavorites] = useState([]); // Define state for user favorites

  // Load the user's favorites when the component mounts
  useEffect(() => {
    const fetchUserFavorites = async () => {
      const user = auth.currentUser; // Get the current logged-in user 
      if (user) {
        try {
          const userRef = collection(db, "users");
          const userQuery = query(userRef, where("email", "==", user.email)); // Filter by email
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0]; // Get the first document (since email should be unique)
            const userData = userDoc.data();

            setUserFavorites(userData.favorites || []); // Set the favorites field from user document
            const userFavoritesIds =
              userData.favorites?.map((pet) => pet.id) || [];
            setFavoritedPets((prevState) => {
              const newState = { ...prevState };
              userFavoritesIds.forEach((id) => (newState[id] = true));
              return newState;
            });
          }
        } catch (error) {
          console.error("Error fetching user favorites:", error);
        } finally {
          setLoading(false); // Set loading to false when fetching is done
        }
      }
    };

    fetchUserFavorites();
  }, []);

  // Function to toggle favorite status of a pet
  const toggleFavorite = async (petId, petData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.log("User is not logged in. Cannot toggle favorite.");
      return;
    }
  
    const userFavoritesRef = doc(db, "users", userId); // User's favorites document reference
  
    // Toggle the favorite status locally
    setFavoritedPets((prevState) => {
      const newState = { ...prevState };
      if (newState[petId]) {
        // If the pet is already favorited, remove it
        delete newState[petId];
        setDoc(
          userFavoritesRef,
          {
            favorites: arrayRemove(petData),
          },
          { merge: true }
        );
      } else {
        // If the pet is not favorited, add it
        newState[petId] = true;
        setDoc(
          userFavoritesRef,
          {
            favorites: arrayUnion(petData),
          },
          { merge: true }
        );
      }
      return newState;
    });
  };

  // Render pet item
  const renderItem = ({ item }) => {
    const isFavorited = favoritedPets[item.id]; // Check if this pet is favorited

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          router.push({
            pathname: "/PetDetails",
            params: {
              ...item,
              images: JSON.stringify(item.images),
            },
          });
        }}
      >
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.favoriteIconButton}
            onPress={() => toggleFavorite(item.id, item)} // Pass pet data to toggleFavorite
          >
            <FontAwesome
              name={isFavorited ? "heart" : "heart-o"}
              size={20}
              color={isFavorited ? "#FF6B6B" : "#FFFFFF"} // Red for heart, white for heart-o
            />
          </TouchableOpacity>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
        </View>
        <View style={styles.petDetailsContainer}>
          <View style={styles.nameGenderContainer}>
            <Text style={styles.name}>{item.petName}</Text>
            <View style={styles.genderContainer}>
              {item.petGender === "Female" ? (
                <Foundation name="female-symbol" size={24} color="#EF5B5B" />
              ) : (
                <Foundation name="male-symbol" size={24} color="#68C2FF" />
              )}
            </View>
          </View>
          <Text style={styles.age}>{item.petAge} Years Old</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <SafeAreaView style={styles.safeArea}>
        <FeedHeader setFilteredPets={setFilteredPets} />

        {pets.length > 0 ? (
          <FlatList
            data={filteredPets}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.container}
          />
        ) : (
          <View style={styles.noPetsContainer}>
            <Text style={styles.noPetsText}>
              No pets available. Add a pet to display here!
            </Text>
          </View>
        )}
      </SafeAreaView>
    </SideBar>
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
    marginBottom: 10,
  },
  card: {
    width: "47%", // Each card occupies 48% of the row width
    marginBottom: 16, // Spacing between rows
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 230,
    shadowColor: "#000", // Shadow color for iOS
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow images to wrap into new rows
  },
  favoriteIconButton: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(128, 128, 128, 0.7)", // Gray with 70% opacity
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    position: "absolute",
    marginLeft: 140,
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: 160,
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
  noPetsContainer: {
    flex: 1, // Allow the container to take full height
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
  noPetsText: {
    textAlign: "center",
    fontFamily: "Lato",
    fontSize: 16,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Lato",
    color: "#68C2FF",
  },
});

export default Feed;
