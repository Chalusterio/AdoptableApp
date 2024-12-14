import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { db } from "../../firebase"; // Ensure `db` is imported from Firebase
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { usePets } from "../context/PetContext";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const screenWidth = Dimensions.get("window").width;

const PetDetailsEdit = () => {
  const { petId } = useLocalSearchParams();
  const [petData, setPetData] = useState(null);
  const { favoritedPets, toggleFavorite } = usePets();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editedPetName, setEditedPetName] = useState("");
  const [editedPetAge, setEditedPetAge] = useState("");
  const [editedPetWeight, setEditedPetWeight] = useState("");
  const [editedPetPersonality, setEditedPetPersonality] = useState("");
  const [editedPetDescription, setEditedPetDescription] = useState("");
  const [editedPetVaccinated, setEditedPetVaccinated] = useState("");
  const [editedPetType, setEditedPetType] = useState("");
  const [editedPetGender, setEditedPetGender] = useState("");
  const [editedAdoptionFee, setEditedAdoptionFee] = useState("");
  const [editedImages, setEditedImages] = useState([]);

  const scrollViewRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petRef = doc(db, "listed_pets", petId);
        const petDoc = await getDoc(petRef);
        if (petDoc.exists()) {
          const pet = petDoc.data();
          setPetData(pet);
          setEditedPetName(pet.petName);
          setEditedPetAge(pet.petAge);
          setEditedPetWeight(pet.petWeight);
          setEditedPetPersonality(pet.petPersonality);
          setEditedPetDescription(pet.petDescription);
          setEditedPetVaccinated(pet.petVaccinated);
          setEditedPetType(pet.petType);
          setEditedPetGender(pet.petGender);
          setEditedAdoptionFee(pet.adoptionFee);
          setEditedImages(pet.images || []);
        } else {
          console.log("Pet not found!");
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      }
    };

    fetchPetData();
  }, [petId]);

  useEffect(() => {
    if (petData && petData.petName) {
      const isPetFavorited = favoritedPets.some(
        (pet) => pet.petName === petData.petName
      );
      setIsFavorited(isPetFavorited);
    }
  }, [favoritedPets, petData]);

  const handleFavoriteToggle = () => {
    // Toggle the favorite status of the pet
    toggleFavorite(petData.petName, {
      petName,
      petType,
      petGender,
      petAge,
      petWeight,
      petDescription,
    });
  };

  const onScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const imageWidth = Dimensions.get("window").width;
    const index = Math.round(contentOffsetX / imageWidth);
    setCurrentIndex(index);
  };

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      const petRef = doc(db, "listed_pets", petId); // Reference to the pet document
      await deleteDoc(petRef);
      alert("Pet deleted successfully!");
      router.back(); // Go back after deletion
    } catch (error) {
      console.error("Error deleting pet:", error);
      alert("Error deleting pet. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      const petRef = doc(db, "listed_pets", petId);
      const updatedPetData = {
        petName: editedPetName,
        petAge: editedPetAge,
        petWeight: editedPetWeight,
        petPersonality: editedPetPersonality,
        petDescription: editedPetDescription,
        petVaccinated: editedPetVaccinated,
        petType: editedPetType,
        petGender: editedPetGender,
        adoptionFee: editedAdoptionFee,
        images: editedImages,
      };

      await updateDoc(petRef, updatedPetData);

      Alert.alert("Success", "Pet details updated successfully!");
      setModalVisible(false);
      setPetData((prev) => ({ ...prev, ...updatedPetData }));
    } catch (error) {
      console.error("Error updating pet: ", error);
      Alert.alert("Error", "Failed to update pet details. Please try again.");
    }
  };

  if (!petData) {
    return <Text>Loading...</Text>;
  }

  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access the media library is required."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const storage = getStorage();
      const imageRef = ref(storage, `pets/${petId}/${Date.now()}.jpg`);
      const response = await fetch(imageUri);
      const blob = await response.blob();

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      setEditedImages((prevImages) => [...prevImages, downloadURL]);
    }
    if (editedImages.length < 5) {
      // Logic to pick image and add it to the editedImages array
      setEditedImages([...editedImages, newImageUri]); // newImageUri is the URI of the picked image
    }
  };

  // Remove image
  const removeImage = (index) => {
    const updatedImages = editedImages.filter((_, idx) => idx !== index);
    setEditedImages(updatedImages);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {petData.images && petData.images.length > 0 && (
          <View>
            <ScrollView
              horizontal={true}
              style={styles.imageScrollContainer}
              ref={scrollViewRef}
              onScroll={onScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
            >
              {petData.images.map((imageURL, index) => (
                <View key={index} style={styles.petImageContainer}>
                  <Image source={{ uri: imageURL }} style={styles.petImage} />
                </View>
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {petData.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Pet Details */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.mainInfoHeader}>
              <Text style={styles.petName}>{petData.petName}</Text>
              <Text style={styles.petTypeIcon}>
                {petData.petType === "Cat" ? (
                  <MaterialCommunityIcons name="cat" size={24} color="#333" />
                ) : (
                  <MaterialCommunityIcons name="dog" size={24} color="#333" />
                )}
              </Text>
              <Text
                style={[
                  styles.petGender,
                  {
                    color: petData.petGender === "Male" ? "#68C2FF" : "#EF5B5B",
                  },
                ]}
              >
                {petData.petGender === "Male" ? (
                  <Foundation name="male-symbol" size={24} color="#68C2FF" />
                ) : (
                  <Foundation name="female-symbol" size={24} color="#EF5B5B" />
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={handleFavoriteToggle}>
              <FontAwesome
                name={isFavorited ? "heart" : "heart-o"}
                size={24}
                color="#FF6B6B"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={styles.subText}
          >{`${petData.petAge} Years | ${petData.petWeight} kg`}</Text>
          <Text style={styles.personalityText}>
            {petData.petPersonality
              ? petData.petPersonality.split(",").join(" ● ")
              : "No personality traits available"}
          </Text>
          <Text style={styles.description}>{petData.petDescription}</Text>
          <Text style={styles.sectionTitle}>Health History:</Text>
          <View>
            <Text style={styles.bulletText}>
              {petData.petVaccinated === "Yes"
                ? "• Vaccinated"
                : "• Not Vaccinated"}
            </Text>
            {petData.petIllnessHistory.split(",").map((illness, index) => (
              <Text key={index} style={styles.bulletText}>
                • {illness.trim()}
              </Text>
            ))}
          </View>
          <Text style={styles.adoptionFee}>₱ {petData.adoptionFee}</Text>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonOuterContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()} // Go back to the previous screen
          >
            <FontAwesome name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Pet Details</Text>

            <ScrollView contentContainerStyle={styles.scrollViewContent2}>
              {/* Pet's Name */}
              <Text style={styles.question}>Pet's Name:</Text>
              <TextInput
                placeholder="Pet's Name"
                value={editedPetName}
                onChangeText={setEditedPetName}
                style={[styles.input]}
              />

              {/* Pet Type - Side by side Buttons */}
              <Text style={styles.question}>Pet Type:</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    editedPetType === "Cat" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setEditedPetType("Cat")}
                >
                  <MaterialCommunityIcons
                    name="cat"
                    size={24}
                    color={editedPetType === "Cat" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      editedPetType === "Cat" && styles.selectedOptionText,
                    ]}
                  >
                    Cat
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    editedPetType === "Dog" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setEditedPetType("Dog")}
                >
                  <MaterialCommunityIcons
                    name="dog"
                    size={24}
                    color={editedPetType === "Dog" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      editedPetType === "Dog" && styles.selectedOptionText,
                    ]}
                  >
                    Dog
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Gender - Side by side Buttons */}
              <Text style={styles.question}>Gender:</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    editedPetGender === "Female" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setEditedPetGender("Female")}
                >
                  <Foundation
                    name="female-symbol"
                    size={24}
                    color={editedPetGender === "Female" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      editedPetGender === "Female" && styles.selectedOptionText,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    editedPetGender === "Male" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setEditedPetGender("Male")}
                >
                  <Foundation
                    name="male-symbol"
                    size={24}
                    color={editedPetGender === "Male" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      editedPetGender === "Male" && styles.selectedOptionText,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Age */}
              <Text style={styles.question}>Age:</Text>
              <TextInput
                placeholder="e.g., 5 Years 3 Months"
                value={editedPetAge}
                onChangeText={setEditedPetAge}
                style={[styles.input]}
              />

              {/* Weight (kg) */}
              <Text style={styles.question}>Weight (kg):</Text>
              <TextInput
                placeholder="e.g., 25"
                value={editedPetWeight}
                onChangeText={setEditedPetWeight}
                keyboardType="number-pad"
                style={[styles.input]}
              />

              {/* Personality */}
              <Text style={styles.question}>Personality:</Text>
              <TextInput
                placeholder="e.g., Friendly, Playful"
                value={editedPetPersonality}
                onChangeText={setEditedPetPersonality}
                style={[styles.input]}
              />

              {/* Description */}
              <Text style={styles.question}>Description:</Text>
              <TextInput
                placeholder="Briefly describe this pet"
                value={editedPetDescription}
                onChangeText={setEditedPetDescription}
                style={[styles.input]}
              />

              {/* Vaccinated - Side by Side Buttons */}
              <Text style={styles.question}>Is the pet vaccinated?</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    editedPetVaccinated === "Yes" &&
                      styles.selectedOptionButton,
                  ]}
                  onPress={() => setEditedPetVaccinated("Yes")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      editedPetVaccinated === "Yes" &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    editedPetVaccinated === "No" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setEditedPetVaccinated("No")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      editedPetVaccinated === "No" && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Adoption Fee */}
              <Text style={styles.question}>Adoption Fee:</Text>
              <TextInput
                placeholder="e.g., 100"
                value={editedAdoptionFee}
                onChangeText={setEditedAdoptionFee}
                keyboardType="number-pad"
                style={[styles.input, styles.adoptionFee]}
              />
              {/* Upload Images */}
              <Text style={styles.question}>Upload Image:</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleImagePick}
                disabled={editedImages.length >= 5} // Disable if 5 images already selected
              ></TouchableOpacity>

              {/* Display Selected Images */}
              <View style={styles.imagePreviewContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imageSlider}
                >
                  {editedImages.map((img, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image
                        source={{ uri: img }}
                        style={styles.previewImage}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(index)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add image button */}
                  {editedImages.length < 5 && (
                    <TouchableOpacity
                      style={styles.addImageContainer}
                      onPress={handleImagePick} // Function to pick a new image
                    >
                      <MaterialIcons name="add" size={50} color="gray" />
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
  },
  petImage: {
    width: screenWidth,
    height: 500,
    resizeMode: "cover",
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
    backgroundColor: "#68C2FF",
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
  mainInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: {
    fontSize: 24,
    fontFamily: "Lilita",
    color: "#333",
    marginRight: 10,
  },
  petTypeIcon: {
    marginHorizontal: 10,
  },
  petGender: {
    fontSize: 24,
    marginLeft: 10,
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
  },
  editButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#EF5B5B",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  picker: {
    backgroundColor: "#F5F5F5",
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "90%",
    marginVertical: 50,
    borderRadius: 10,
    overflow: "hidden",
  },
  scrollViewContent2: {
    padding: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 50,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#68C2FF",
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
    marginBottom: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 5,
    marginHorizontal: 5,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#C2C2C2",
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#666",
  },
  selectedOptionButton: {
    backgroundColor: "#E6F4FF",
    borderColor: "#68C2FF",
  },
  selectedOptionText: {
    color: "#68C2FF",
  },
  adoptionFee: {
    fontSize: 25,
    fontFamily: "Lilita",
    color: "#EF5B5B",
    marginRight: 10,
    marginTop: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Lilita",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 30,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    marginTop: 10,
    paddingBottom: 10,
  },
  imageSlider: {
    alignItems: "center",
  },
  imagePreview: {
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 15,
  },
  removeButtonText: {
    fontSize: 12,
    color: "red",
  },
  addImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default PetDetailsEdit;