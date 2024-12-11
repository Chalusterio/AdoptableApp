import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SideBar from "../components/SideBar";
import { usePets } from "../context/PetContext"; // Adjust the path as needed
import { db, auth } from "../../firebase"; // Ensure `auth` and `db` are imported from Firebase
import { Surface } from "react-native-paper";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

const Favorites = () => {
  const { favoritedPets, setFilteredPets, pets, toggleFavorite, } = usePets(); // Use favoritedPets from context
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState("Favorites");

  // Fetch the current user's favorites
  useEffect(() => {
    const fetchUserFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        // Get the user's document from the Firestore 'users' collection
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userFavorites = userData.favorites || [];

          // Filter the pets based on the user’s favorites
          const favoritePets = pets.filter((pet) => userFavorites.includes(pet.id));

          // Set the filtered pets as favorited pets for the current user
          setFilteredPets(favoritePets);
        }
      }
    };

    fetchUserFavorites();
  }, [pets, setFilteredPets]);

  // Render pet item
  const renderItem = ({ item }) => {
    const isFavorited = favoritedPets.some((favPet) => favPet.id === item.id);

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
          <Text style={styles.age}>{item.petAge}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <SafeAreaView style={styles.safeArea}>
        <Surface style={styles.titleContainer} elevation={3}>
          <Text style={styles.title}>Your Favorite Pets</Text>
        </Surface>

        {favoritedPets.length > 0 ? (
          <FlatList
            data={favoritedPets} // Display only favorited pets
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.container}
          />
        ) : (
          <View style={styles.noPetsContainer}>
            <Text style={styles.noPetsText}>No favorite pets available.</Text>
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
  titleContainer: {
    width: '100%',
    height: 95,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderBottomEndRadius: 30,
    borderBottomLeftRadius: 30,
  },
  title: {
    fontFamily: "Lilita",
    fontSize: 24,
    color: "#68C2FF",
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
});

export default Favorites;