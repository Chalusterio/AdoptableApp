import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import FeedHeader from "../../components/FeedHeader";
import SideBar from "../../components/SideBar";
import { usePets } from "../../context/PetContext";
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
import { db, auth } from "../../../firebase";

const Feed = () => {
  const params = useLocalSearchParams();
  const { pets } = usePets();
  const router = useRouter();
  const { filteredPets, setFilteredPets } = usePets();
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState("Main");

  const selectedImages = params.selectedImages
    ? JSON.parse(params.selectedImages)
    : [];

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

  const [favoritedPets, setFavoritedPets] = useState({});
  const [userFavorites, setUserFavorites] = useState([]);

  const [refreshing, setRefreshing] = useState(false); // State to handle refresh loading

  // Update this to fetch preferences and rank pets when refresh is triggered
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPreferencesAndRankPets(true); // Pass `true` to indicate that it's a refresh
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchUserFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        console.log("Fetching user favorites...");
        try {
          const userRef = collection(db, "users");
          const userQuery = query(userRef, where("email", "==", user.email));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            setUserFavorites(userData.favorites || []);
            const userFavoritesIds =
              userData.favorites?.map((pet) => pet.id) || [];
            setFavoritedPets((prevState) => {
              const newState = { ...prevState };
              userFavoritesIds.forEach((id) => (newState[id] = true));
              return newState;
            });
            console.log("User favorites fetched successfully.");
          }
        } catch (error) {
          console.error("Error fetching user favorites:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserFavorites();
  }, []);

  const toggleFavorite = async (petId, petData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.log("User is not logged in. Cannot toggle favorite.");
      return;
    }

    const userFavoritesRef = doc(db, "users", userId);

    console.log(`Toggling favorite for pet: ${petId}`);
    setFavoritedPets((prevState) => {
      const newState = { ...prevState };
      if (newState[petId]) {
        delete newState[petId];
        setDoc(
          userFavoritesRef,
          {
            favorites: arrayRemove(petData),
          },
          { merge: true }
        );
        console.log(`Removed pet ${petId} from favorites.`);
      } else {
        newState[petId] = true;
        setDoc(
          userFavoritesRef,
          {
            favorites: arrayUnion(petData),
          },
          { merge: true }
        );
        console.log(`Added pet ${petId} to favorites.`);
      }
      return newState;
    });
  };

  const fetchPreferencesAndRankPets = async (isRefresh = false) => {
    const user = auth.currentUser;
    if (!user) return;
  
    console.log("Fetching preferences and ranking pets...");
    try {
      const preferencesQuery = query(collection(db, "preferences"), where("userEmail", "==", user.email));
      const preferencesSnapshot = await getDocs(preferencesQuery);
  
      let rankedPets = pets.map((pet) => {
        let score = 0;
  
        if (preferencesSnapshot.empty) {
          // No preferences, so just return the pet as is
          return { ...pet, score: 0 }; // Default score 0 for no match
        }
  
        const userPreferences = preferencesSnapshot.docs[0].data();
  
        // Matching personality
        if (pet.petPersonality && pet.petPersonality.includes(userPreferences.personalityLabel)) {
          score += 1; // Add score for personality match
        }
  
        // Matching pet size based on weight and label
        const petWeight = parseInt(pet.petWeight, 10);
        let matchesSizeLabel = false;
        const sizeRangeMatch = userPreferences.petSizeLabel.match(/(\d+)-(\d+)/);
        if (sizeRangeMatch) {
          const minSize = parseInt(sizeRangeMatch[1], 10);
          const maxSize = parseInt(sizeRangeMatch[2], 10);
          matchesSizeLabel = petWeight >= minSize && petWeight <= maxSize;
          if (matchesSizeLabel) {
            score += 1; // Add score for size match
          }
        }
  
        // Matching gender
        const matchesGender = userPreferences.selectedGender === "any" || (pet.petGender && pet.petGender.toLowerCase() === userPreferences.selectedGender.toLowerCase());
        if (matchesGender) {
          score += 1; // Add score for gender match
        }
  
        // Matching pet type
        const matchesPetType = userPreferences.selectedPet === "any" || (pet.petType && pet.petType.toLowerCase() === userPreferences.selectedPet.toLowerCase());
        if (matchesPetType) {
          score += 1; // Add score for pet type match
        }
  
        // Add a ranking property to each pet for sorting
        return { ...pet, score };
      });
  
      // If no preferences are matched, just return all pets as they are
      if (preferencesSnapshot.empty) {
        rankedPets = pets.map((pet) => ({ ...pet, score: 0 })); // Default score 0 for all pets
      }
  
      // Sort pets based on the score
      rankedPets = rankedPets.sort((a, b) => b.score - a.score);
  
      // Shuffle pets only if it's a refresh
      const shuffledPets = isRefresh ? shuffleArray(rankedPets) : rankedPets;
  
      setFilteredPets(shuffledPets);
      console.log(`Ranked pets: ${shuffledPets.length} pets ranked and shuffled based on preferences.`);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Shuffle function
  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  useEffect(() => {
    fetchPreferencesAndRankPets(); // Initial fetch when the component mounts
  }, [pets]); // Depend on pets so it re-runs when pets data changes

  const renderItem = ({ item }) => {
    const isFavorited = favoritedPets[item.id];

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
            onPress={() => toggleFavorite(item.id, item)}
          >
            <FontAwesome
              name={isFavorited ? "heart" : "heart-o"}
              size={20}
              color={isFavorited ? "#FF6B6B" : "#FFFFFF"}
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
          <Text style={styles.age}>{item.petAge} years old</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <SafeAreaView style={styles.safeArea}>
        <FeedHeader setFilteredPets={setFilteredPets} />
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
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
