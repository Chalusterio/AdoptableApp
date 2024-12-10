import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Firestore functions
import { getAuth } from "firebase/auth"; // To get the current user
import SideBar from "../components/SideBar"; // Importing the SideBar component

const Upload = () => {
  const [pets, setPets] = useState([]); // State to store fetched pets
  const db = getFirestore(); // Initialize Firestore
  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    const fetchUserPets = async () => {
      const currentUser = auth.currentUser; // Get the logged-in user

      if (!currentUser) {
        console.warn("No user is logged in.");
        return;
      }

      try {
        const petsCollection = collection(db, "listed_pets"); // Reference to Firestore collection
        const q = query(petsCollection, where("listedBy", "==", currentUser.email)); // Filter by current user's email
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

  return (
    <SideBar selectedItem="My Uploads" setSelectedItem={() => {}}>
      <View style={styles.container}>
        <Text style={styles.title}>Uploads</Text>
        <ScrollView contentContainerStyle={styles.content}>
          {pets.length > 0 ? (
            pets.map((pet) => (
              <View key={pet.id} style={styles.petCard}>
                <Text style={styles.petName}>{pet.petName}</Text>
                <Text style={styles.petDetails}>Type: {pet.petType}</Text>
                <Text style={styles.petDetails}>Age: {pet.petAge}</Text>
                <Text style={styles.petDetails}>Weight: {pet.petWeight}</Text>
                <Text style={styles.petDescription}>Description: {pet.petDescription}</Text>

                {pet.images && pet.images.length > 0 && (
                  <ScrollView horizontal style={styles.imagesContainer}>
                    {pet.images.map((image, idx) => (
                      <Image key={idx} source={{ uri: image }} style={styles.petImage} />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noPetsText}>You haven't posted any pets yet.</Text>
          )}
        </ScrollView>
      </View>
    </SideBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white", // Changed to white for clarity
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#68C2FF", // Set the color to #68C2FF
    fontFamily: "Lilita", // Set the font to Lilita
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
  },
  petCard: {
    backgroundColor: "#fff",
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  petName: {
    fontSize: 22,
    color: "#333",
    marginBottom: 10,
  },
  petDetails: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  petDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  imagesContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    resizeMode: "cover",
  },
  noPetsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Upload;
