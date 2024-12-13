import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { usePets } from "../context/PetContext";
import { getAuth } from "firebase/auth";
import SideBar from "../components/SideBar";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Upload = () => {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const db = getFirestore();
  const auth = getAuth();
  const [selectedItem, setSelectedItem] = useState("Uploads");
  const [loading, setLoading] = useState(true);
  const { favoritedPets, toggleFavorite } = usePets();

  useEffect(() => {
    const fetchUserPets = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("No user is logged in.");
        setLoading(false);
        return;
      }
      try {
        const petsCollection = collection(db, "listed_pets");
        const q = query(petsCollection, where("listedBy", "==", currentUser.email));
        const snapshot = await getDocs(q);
        const petsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPets();
  }, []);

  const handlePetDetailsEdit = (pet) => {
    router.push({
      pathname: "/PetDetailsEdit",
      params: {
        petId: pet.id,
        petName: pet.petName,
        petType: pet.petType,
        petGender: pet.petGender,
        petAge: pet.petAge,
        petWeight: pet.petWeight,
        petPersonality: pet.petPersonality,
        petDescription: pet.petDescription,
        petIllnessHistory: pet.petIllnessHistory,
        petVaccinated: pet.petVaccinated,
        adoptionFee: pet.adoptionFee,
        images: JSON.stringify(pet.images),
      },
    });
  };
    

  const renderItem = ({ item }) => {
    const isFavorited = favoritedPets.some((favPet) => favPet.id === item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handlePetDetailsEdit(item)}
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
          <Text style={styles.age}>{`${item.petAge} years old`}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <View style={styles.container}>
        <Text style={styles.titleText}>Uploads</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#68C2FF" />
        ) : pets.length > 0 ? (
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
            <Text style={styles.noPetsText}>You haven't uploaded any pets yet.</Text>
          </View>
        )}
      </View>
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
});

export default Upload;
