import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Firestore functions
import { getAuth } from "firebase/auth"; // To get the current user
import SideBar from "../components/SideBar"; // Importing the SideBar component
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome for heart icons
import { Foundation } from "@expo/vector-icons"; // Import Foundation icons
import { useRouter } from "expo-router"; // Get params and router for navigation

const Upload = () => {
  const router = useRouter();
  const [pets, setPets] = useState([]); // State to store fetched pets
  const db = getFirestore(); // Initialize Firestore
  const auth = getAuth(); // Initialize Firebase Auth
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [selectedPet, setSelectedPet] = useState(null); // State to store selected pet details
  const [selectedItem, setSelectedItem] = useState("Uploads");

  // State to track favorited pets by their IDs
  const [favoritedPets, setFavoritedPets] = useState({});

  // Function to toggle favorite status of a pet
  const toggleFavorite = (petId) => {
    setFavoritedPets((prevState) => ({
      ...prevState,
      [petId]: !prevState[petId],
    }));
  };

  useEffect(() => {
    const fetchUserPets = async () => {
      const currentUser = auth.currentUser; // Get the logged-in user

      if (!currentUser) {
        console.warn("No user is logged in.");
        return;
      }

      try {
        const petsCollection = collection(db, "listed_pets"); // Reference to Firestore collection
        const q = query(
          petsCollection,
          where("listedBy", "==", currentUser.email)
        ); // Filter by current user's email
        const snapshot = await getDocs(q);
        const petsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(petsData); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };

    fetchUserPets();
  }, []); // Run only once when the component mounts

  // Open the modal and set the selected pet
  const openModal = (pet) => {
    setSelectedPet(pet);
    setIsModalVisible(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPet(null);
  };

  const handlePetDetailsEdit = (pet) => {
    router.push({
      pathname: "/PetDetailsEdit",
      params: { petId: pet.id },
    });
  };

  // Render pet item
  const renderItem = ({ item }) => {
    const isFavorited = favoritedPets[item.id]; // Check if this pet is favorited

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handlePetDetailsEdit(item)} // Pass the selected pet as a parameter
      >
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.favoriteIconButton}
            onPress={() => toggleFavorite(item.id)} // Toggle the favorite for this pet
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
      <View style={styles.container}>
        <Text style={styles.titleText}>Uploads</Text>
        {pets.length > 0 ? (
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.scrollViewContent}
          />
        ) : (
          <View style={styles.noPetsContainer}>
            <Text style={styles.noPetsText}>
              You haven't uploaded any pets yet.
            </Text>
          </View>
        )}
      </View>

      {/* Pet Details Modal */}
      {selectedPet && (
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Image
                  source={{ uri: selectedPet.images[0] }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>{selectedPet.petName}</Text>
                <Text style={styles.modalDescription}>
                  {selectedPet.petDescription}
                </Text>
                <View style={styles.modalInfoContainer}>
                  <Text style={styles.modalAge}>
                    {selectedPet.petAge} years old
                  </Text>
                  <Text style={styles.modalGender}>
                    {selectedPet.petGender === "Female" ? "Female" : "Male"}
                  </Text>
                </View>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SideBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  titleText: {
    fontFamily: "Lilita",
    fontSize: 25,
    color: "#68C2FF",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  scrollViewContent: {
    paddingBottom: 10,
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
    marginTop: 10,
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
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  // Modal styles
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Backdrop color
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%", // Same width as pet card
  },
  modalContent: {
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  modalInfoContainer: {
    marginBottom: 20,
  },
  modalAge: {
    fontSize: 16,
    color: "#555",
  },
  modalGender: {
    fontSize: 16,
    color: "#555",
  },
  modalButtonContainer: {
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#68C2FF",
    padding: 10,
    borderRadius: 5,
    width: "80%",
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default Upload;
