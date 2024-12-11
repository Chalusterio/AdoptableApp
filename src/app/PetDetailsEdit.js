import React, { useState, useRef } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { db } from "../../firebase"; // Ensure `db` is imported from Firebase
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // Import Picker

const screenWidth = Dimensions.get("window").width;

const PetDetailsEdit = () => {
  const {
    petName,
    petType,
    petGender,
    petAge,
    petWeight,
    petPersonality,
    petDescription,
    petIllnessHistory,
    petVaccinated,
    images,
    petId,  // Assuming petId is passed in the params for the pet
  } = useLocalSearchParams();
  
  const parsedImages = JSON.parse(images || "[]");

  const [isFavorited, setIsFavorited] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editedPetName, setEditedPetName] = useState(petName);
  const [editedPetAge, setEditedPetAge] = useState(petAge);
  const [editedPetWeight, setEditedPetWeight] = useState(petWeight);
  const [editedPetPersonality, setEditedPetPersonality] = useState(petPersonality);
  const [editedPetDescription, setEditedPetDescription] = useState(petDescription);
  const [editedPetVaccinated, setEditedPetVaccinated] = useState(petVaccinated);
  const [editedPetType, setEditedPetType] = useState(petType);
  const [editedPetGender, setEditedPetGender] = useState(petGender);

  const scrollViewRef = useRef(null);
  const router = useRouter();

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
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
      console.error("Error deleting pet: ", error);
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
      };
      await updateDoc(petRef, updatedPetData);
      alert("Pet details updated successfully!");
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating pet: ", error);
      alert("Error updating pet details. Please try again.");
    }
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
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
            >
              {parsedImages.map((imageURL, index) => (
                <View key={index} style={styles.petImageContainer}>
                  <Image source={{ uri: imageURL }} style={styles.petImage} />
                </View>
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {parsedImages.map((_, index) => (
                <View
                  key={index}
                  style={[styles.paginationDot, index === currentIndex && styles.activeDot]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Pet Details */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.mainInfoHeader}>
              <Text style={styles.petName}>{petName}</Text>
              <Text style={styles.petTypeIcon}>
                {petType === "Cat" ? (
                  <MaterialCommunityIcons name="cat" size={24} color="#333" />
                ) : (
                  <MaterialCommunityIcons name="dog" size={24} color="#333" />
                )}
              </Text>
              <Text
                style={[styles.petGender, { color: petGender === "Male" ? "#68C2FF" : "#EF5B5B" }]}
              >
                {petGender === "Male" ? (
                  <Foundation name="male-symbol" size={24} color="#68C2FF" />
                ) : (
                  <Foundation name="female-symbol" size={24} color="#EF5B5B" />
                )}
              </Text>
            </View>
          </View>
          <Text style={styles.subText}>{`${petAge} | ${petWeight}`}</Text>
          <Text style={styles.personalityText}>
            {petPersonality ? petPersonality.split(",").join(" ● ") : "No personality traits available"}
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
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
                  style={[styles.optionButton, editedPetType === "Cat" && styles.selectedOptionButton]}
                  onPress={() => setEditedPetType("Cat")}
                >
                  <MaterialCommunityIcons
                    name="cat"
                    size={24}
                    color={editedPetType === "Cat" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[styles.optionText, editedPetType === "Cat" && styles.selectedOptionText]}
                  >
                    Cat
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, editedPetType === "Dog" && styles.selectedOptionButton]}
                  onPress={() => setEditedPetType("Dog")}
                >
                  <MaterialCommunityIcons
                    name="dog"
                    size={24}
                    color={editedPetType === "Dog" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[styles.optionText, editedPetType === "Dog" && styles.selectedOptionText]}
                  >
                    Dog
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Gender - Side by side Buttons */}
              <Text style={styles.question}>Gender:</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.optionButton, editedPetGender === "Female" && styles.selectedOptionButton]}
                  onPress={() => setEditedPetGender("Female")}
                >
                  <Foundation
                    name="female-symbol"
                    size={24}
                    color={editedPetGender === "Female" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[styles.optionText, editedPetGender === "Female" && styles.selectedOptionText]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, editedPetGender === "Male" && styles.selectedOptionButton]}
                  onPress={() => setEditedPetGender("Male")}
                >
                  <Foundation
                    name="male-symbol"
                    size={24}
                    color={editedPetGender === "Male" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[styles.optionText, editedPetGender === "Male" && styles.selectedOptionText]}
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
                  style={[styles.optionButton, editedPetVaccinated === "Yes" && styles.selectedOptionButton]}
                  onPress={() => setEditedPetVaccinated("Yes")}
                >
                  <Text
                    style={[styles.optionText, editedPetVaccinated === "Yes" && styles.selectedOptionText]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, editedPetVaccinated === "No" && styles.selectedOptionButton]}
                  onPress={() => setEditedPetVaccinated("No")}
                >
                  <Text
                    style={[styles.optionText, editedPetVaccinated === "No" && styles.selectedOptionText]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>

            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },
  picker: {
    backgroundColor: "#F5F5F5",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#CCC",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#68C2FF",
    padding: 10,
    borderRadius: 5,
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
    borderRadius: 25,
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
});



export default PetDetailsEdit;
