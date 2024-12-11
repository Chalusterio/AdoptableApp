import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SideBar from "../components/SideBar";
import { usePets } from "../context/PetContext";
import { db, auth } from "../../firebase"; // Firebase imports
import { Surface } from "react-native-paper";
import { collection, query, where, getDocs } from "firebase/firestore";

const Requests = () => {
  const { toggleFavorite, favoritedPets, requestedPets, setRequestedPets } = usePets(); // Context hooks
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState("Requests");
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchRequestedPets = async () => {
      setIsLoading(true); // Start loading
      const user = auth.currentUser;

      if (user) {
        try {
          // Fetch pet requests for the current user
          const petRequestsRef = collection(db, "pet_request");
          const q = query(
            petRequestsRef,
            where("adopterEmail", "==", user.email),
            where("status", "==", "Pending")
          );
          const querySnapshot = await getDocs(q);

          const fetchedRequests = [];
          querySnapshot.forEach((doc) => {
            fetchedRequests.push(doc.data());
          });

          setRequestedPets(fetchedRequests); // Set the filtered pets to the state
        } catch (error) {
          console.error("Error fetching requested pets:", error);
        }
      }
      setIsLoading(false); // Stop loading
    };

    fetchRequestedPets();
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  // Render pet item
  const renderItem = ({ item }) => {
  // Ensure images is defined and not empty
  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : ["default_image_url"]; // Default image if none

  // Check if the pet is already favorited by the current user
  const isFavorited = favoritedPets.some(
    (favPet) => favPet.id === item.petId
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: "/PetDetails",
          params: {
            ...item,
            images: JSON.stringify(images), // Pass valid images array
          },
        });
      }}
    >
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.favoriteIconButton}
          onPress={() => toggleFavorite(item.petId, item)} // Pass pet data to toggleFavorite
        >
          <FontAwesome
            name={isFavorited ? "heart" : "heart-o"}
            size={20}
            color={isFavorited ? "#FF6B6B" : "#FFFFFF"} // Red for heart, white for heart-o
          />
        </TouchableOpacity>
        <Image source={{ uri: images[0] }} style={styles.image} />
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
          <Text style={styles.title}>Your Requested Pets</Text>
        </Surface>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#68C2FF" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : requestedPets.length > 0 ? (
          <FlatList
            data={requestedPets}
            keyExtractor={(item) => item.petId}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.container}
          />
        ) : (
          <View style={styles.noPetsContainer}>
            <Text style={styles.noPetsText}>No pending requests available.</Text>
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
    width: "100%",
    height: 95,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
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
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    width: "47%",
    marginBottom: 16,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 230,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  favoriteIconButton: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(128, 128, 128, 0.7)",
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  petDetailsContainer: {
    flex: 1,
    margin: 13,
    alignItems: "center",
  },
  nameGenderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontFamily: "LatoBold",
    color: "black",
    marginRight: 8,
  },
  age: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#C2C2C2",
  },
  noPetsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default Requests;