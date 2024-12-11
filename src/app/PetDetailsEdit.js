import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { db, auth } from "../../firebase"; // Ensure `auth` is imported from Firebase
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";

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
    // Open the modal to edit pet details
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Are you sure you want to delete {petName}?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDelete}
              >
                <Text style={styles.confirmButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            {/* Add form fields for editing here */}
            {/* For example: */}
            {/* <TextInput value={petName} onChangeText={setPetName} /> */}
            {/* Other fields */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
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
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#DDD",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#555",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#68C2FF",
    padding: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    textAlign: "center",
    color: "#FFF",
  },
});

export default PetDetailsEdit;
