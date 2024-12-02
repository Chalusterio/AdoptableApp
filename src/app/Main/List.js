import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const List = () => {
  const router = useRouter();

  const [petName, setPetName] = useState("");
  const [petGender, setSelectedPetGender] = useState(null);
  const [petAge, setPetAge] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [petPersonality, setPetPersonality] = useState("");
  const [petDescription, setPetDescription] = useState("");
  const [petIllnessHistory, setPetIllnessHistory] = useState("");
  const [petVaccinated, setPetVaccinated] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const MAX_IMAGES = 5; // Limit for images

  const [errors, setErrors] = useState({
    petName: "",
    petGender: "",
    petAge: "",
    petWeight: "",
    petPersonality: "",
    petDescription: "",
    petIllnessHistory: "",
    petVaccinated: "",
  });

  // Function to pick images
  const pickImages = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      alert(`You can only select up to ${MAX_IMAGES} images.`);
      return; // Prevent adding more images if the limit is reached
    }
  
    // Request permission to access the image library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access the media library is required!");
      return;
    }
  
    // Launch image picker and get the selected images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - selectedImages.length, // Dynamically adjust the selection limit
      quality: 1, // Highest quality
    });
  
    console.log("Image Picker Result:", result); // Log the result for debugging
  
    if (!result.canceled && result.assets) {
      console.log(
        "Selected Images:",
        result.assets.map((image) => image.uri)
      );
  
      // Add the new images to the existing selected images
      setSelectedImages((prevImages) => [
        ...prevImages,
        ...result.assets.map((image) => ({ uri: image.uri })), // Use object format
      ]);
    } else if (result.canceled) {
      console.log("Image selection canceled.");
    } else {
      alert("No images selected.");
    }
  };
  
  // Function to remove an image from the selected images array
  const handleImageRemove = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  const handleListPet = () => {
    const selectedImageURIs = selectedImages.map((image) => image.uri);
  
    if (
      petName &&
      petGender !== null &&
      petAge &&
      petWeight &&
      petPersonality &&
      petDescription &&
      petIllnessHistory &&
      petVaccinated !== null &&
      selectedImageURIs.length > 0
    ) {
      const serializedImages = JSON.stringify(selectedImageURIs);
  
      router.push({
        pathname: "/Main",
        params: {
          petName,
          petGender,
          petAge,
          petWeight,
          petPersonality,
          petDescription,
          petIllnessHistory,
          petVaccinated,
          selectedImages: serializedImages,
        },
      });
    } else {
      alert("Please complete all fields before proceeding.");
    }
  };  

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>List A Pet For Adoption</Text>
            </View>

            {/* Form Field */}
            <View style={styles.formContainer}>
              <Text style={styles.question}>Pet's Name:</Text>
              <TextInput
                placeholder="Pet's Name"
                value={petName}
                onChangeText={setPetName}
                style={[styles.input, errors.petName && styles.errorInput]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="gray"
              />
              {errors.petName && (
                <Text style={styles.errorText}>{errors.petName}</Text>
              )}

              <Text style={styles.question}>Gender:</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    petGender === "female" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setSelectedPetGender("female")}
                >
                  <Foundation
                    name="female-symbol"
                    size={24}
                    color={petGender === "female" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      petGender === "female" && styles.selectedOptionText,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    petGender === "male" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setSelectedPetGender("male")}
                >
                  <Foundation
                    name="male-symbol"
                    size={24}
                    color={petGender === "male" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      petGender === "male" && styles.selectedOptionText,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.question}>Age:</Text>
              <TextInput
                placeholder="e.g., 5 Years 3 Months"
                value={petAge}
                onChangeText={setPetAge}
                style={[styles.input, errors.petAge && styles.errorInput]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="gray"
              />
              {errors.petAge && (
                <Text style={styles.errorText}>{errors.petAge}</Text>
              )}

              <Text style={styles.question}>Weight (kg):</Text>
              <TextInput
                placeholder="e.g., 25 kg"
                value={petWeight}
                onChangeText={setPetWeight}
                style={[styles.input, errors.petWeight && styles.errorInput]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="gray"
              />
              {errors.petWeight && (
                <Text style={styles.errorText}>{errors.petWeight}</Text>
              )}

              <Text style={styles.question}>
                In 3 words, how would you describe this pet's personality?
              </Text>
              <TextInput
                placeholder="e.g., Friendly, Playful, Loyal"
                value={petPersonality}
                onChangeText={setPetPersonality}
                style={[
                  styles.input,
                  errors.petPersonality && styles.errorInput,
                ]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="gray"
              />
              {errors.petPersonality && (
                <Text style={styles.errorText}>{errors.petPersonality}</Text>
              )}

              <Text style={styles.question}>Briefly describe this pet:</Text>
              <TextInput
                placeholder="Provide a brief description of this pet's characteristics"
                value={petDescription}
                onChangeText={setPetDescription}
                style={[
                  styles.input,
                  styles.textArea,
                  errors.petDescription && styles.errorInput,
                ]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="gray"
                multiline={true}
                numberOfLines={7}
                textAlignVertical="top"
              />
              {errors.petDescription && (
                <Text style={styles.errorText}>{errors.petDescription}</Text>
              )}

              <Text style={styles.question}>Any history of illness?</Text>
              <TextInput
                placeholder="Mention if the pet has any history of illness (or write None)"
                value={petIllnessHistory}
                onChangeText={setPetIllnessHistory}
                style={[
                  styles.input,
                  styles.textArea,
                  errors.petIllnessHistory && styles.errorInput,
                ]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="gray"
                multiline={true}
                numberOfLines={7}
                textAlignVertical="top"
              />
              {errors.petDescription && (
                <Text style={styles.errorText}>{errors.petIllnessHistory}</Text>
              )}

              <Text style={styles.question}>Is the pet vaccinated?</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton1,
                    petVaccinated === "Yes" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setPetVaccinated("Yes")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      petVaccinated === "Yes" && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton1,
                    petVaccinated === "No" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setPetVaccinated("No")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      petVaccinated === "No" && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Image Upload */}
              <Text style={styles.question}>Upload picture(s):</Text>
              <View style={styles.uploadContainer}>
                {selectedImages.length === 0 ? (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImages}
                  >
                    <MaterialIcons
                      name="cloud-upload"
                      size={50}
                      color="#C2C2C2"
                    />
                    <Text style={styles.uploadText}>Maximum of 5 Pictures</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imagePreviewContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.imageSlider}
                    >
                      {selectedImages.map((image, index) => (
                        <View key={index} style={styles.imagePreview}>
                          <Image
                            source={{ uri: image.uri }}
                            style={styles.selectedImage}
                          />
                          <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => handleImageRemove(index)}
                          >
                            <MaterialIcons name="close" size={20} color="red" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {/* Show "add" icon if fewer than 5 images */}
                      {selectedImages.length < 5 && (
                        <TouchableOpacity
                          style={styles.addImageContainer}
                          onPress={pickImages}
                        >
                          <MaterialIcons name="add" size={50} color="gray" />
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.listPetButton}
                onPress={handleListPet}
              >
                <Text style={styles.listPetButtonText}>List this pet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flexContainer: {
    flex: 1,
    marginBottom: -80,
  },
  scrollViewContent: {
    paddingBottom: 10,
  },
  container: {
    flex: 1,
    width: "100%",
    padding: 30,
    paddingBottom: 100,
  },
  titleContainer: {
    width: "100%",
  },
  titleText: {
    fontFamily: "Lilita",
    fontSize: 25,
    color: "#68C2FF",
  },
  formContainer: {
    width: "100%",
  },
  question: {
    marginTop: 20,
    fontFamily: "Lato",
    fontSize: 18,
  },
  input: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "#F5F5F5",
  },
  textArea: {
    height: 150,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#C2C2C2",
    borderRadius: 8,
    paddingVertical: 5,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
  },
  optionButton1: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#C2C2C2",
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
  },
  selectedOptionButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#68C2FF",
  },
  optionText: {
    color: "gray",
    marginLeft: 10,
  },
  selectedOptionText: {
    color: "#68C2FF",
  },
  uploadContainer: {
    width: "100%",
    height: 210,
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    textAlign: "center",
    fontFamily: "Lato",
    fontSize: 18,
    color: "#C2C2C2",
  },
  listPetButton: {
    backgroundColor: "#EF5B5B",
    width: '100%',
    height: '50',
    borderRadius: 30,
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 30,
  },
  listPetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Add some space between images
    alignItems: "center",
    width: "100%",
  },
  imageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 10,
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  closeIcon: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    marginLeft: 180,
  },
  addImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 150,
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 10,
    borderStyle: "dashed",
    marginHorizontal: 10,
  },
});

export default List;
