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
import { TextInput, Dialog, Portal } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { usePets } from "../../components/PetContext"; // Adjust the path as needed
const { width } = Dimensions.get("window");

const List = () => {
  const router = useRouter();

  const { addPet } = usePets(); // Access the context

  const [petName, setPetName] = useState("");
  const [petGender, setSelectedPetGender] = useState(null);
  const [petAge, setPetAge] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [petPersonality, setPetPersonality] = useState("");
  const [petDescription, setPetDescription] = useState("");
  const [petIllnessHistory, setPetIllnessHistory] = useState("");
  const [petVaccinated, setPetVaccinated] = useState(null);
  const [adoptionFee, setAdoptionFee] = useState("");

  const [selectedImages, setSelectedImages] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false); // Dialog visibility state

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
    adoptionFee: "",
  });

  // Function to pick images
  const pickImages = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      alert(`You can only select up to ${MAX_IMAGES} images.`);
      return;
    }

    // Request permission to access the media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Allows selecting multiple images
      selectionLimit: MAX_IMAGES - selectedImages.length,
      quality: 1, // High-quality images
    });

    console.log("Image Picker Result:", result);

    if (!result.canceled && result.assets) {
      // Resolve each URI and update the state
      const resolvedImages = await Promise.all(
        result.assets.map(async (image) => {
          // Save the image to the app's file system
          const fileName = image.uri.split("/").pop();
          const fileUri = FileSystem.documentDirectory + fileName;

          // Move the file to the document directory
          await FileSystem.copyAsync({
            from: image.uri,
            to: fileUri,
          });

          // Return the file URI
          return { uri: fileUri };
        })
      );

      // Add resolved URIs to the selected images
      setSelectedImages((prevImages) => [...prevImages, ...resolvedImages]);
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
      adoptionFee &&
      selectedImageURIs.length > 0
    ) {
      const newPet = {
        id: Date.now().toString(), // Unique ID
        petName,
        petGender,
        petAge,
        petWeight,
        petPersonality,
        petDescription,
        petIllnessHistory,
        petVaccinated,
        adoptionFee,
        images: selectedImageURIs,
      };

      // Reset the form fields
      setAdoptionFee("");
      setPetName("");
      setSelectedPetGender(null);
      setPetAge("");
      setPetWeight("");
      setPetPersonality("");
      setPetDescription("");
      setPetIllnessHistory("");
      setPetVaccinated(null);
      setAdoptionFee("");
      setSelectedImages([]); // Reset selected images

      addPet(newPet); // Add the new pet to the context

      // Navigate to Feed or another page
      router.push("/Main"); // Adjust the path
    } else {
      setDialogVisible(true); // Show the dialog when fields are incomplete
    }
  };

  const hideDialog = () => setDialogVisible(false); // Function to hide the dialog

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
                label="Pet's Name"
                value={petName}
                onChangeText={setPetName}
                style={[styles.input, errors.petName && styles.errorInput]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="#68C2FF"
              />
              {errors.petName && (
                <Text style={styles.errorText}>{errors.petName}</Text>
              )}

              <Text style={styles.question}>Gender:</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    petGender === "Female" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setSelectedPetGender("Female")}
                >
                  <Foundation
                    name="female-symbol"
                    size={24}
                    color={petGender === "Female" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      petGender === "Female" && styles.selectedOptionText,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    petGender === "Male" && styles.selectedOptionButton,
                  ]}
                  onPress={() => setSelectedPetGender("Male")}
                >
                  <Foundation
                    name="male-symbol"
                    size={24}
                    color={petGender === "Male" ? "#68C2FF" : "#C2C2C2"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      petGender === "Male" && styles.selectedOptionText,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.question}>Age:</Text>
              <TextInput
                placeholder="e.g., 5 Years 3 Months"
                label="e.g., 5 Years 3 Months"
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
                placeholder="e.g., 25"
                label="e.g., 25"
                value={petWeight} // 'petWeight' now includes the 'kg' suffix
                keyboardType="number-pad"
                onChangeText={(text) => {
                  // Remove any non-numeric characters (to handle cases where users paste text)
                  const numericInput = text.replace(/[^0-9]/g, "");

                  // Limit the input to a maximum of two digits
                  const limitedInput = numericInput.slice(0, 2);

                  // Set the numeric value and append "kg"
                  setPetWeight(limitedInput ? `${limitedInput} kg` : ""); // Append "kg" to the value
                }}
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
                label="e.g., Friendly, Playful, Loyal"
                value={petPersonality} // The value includes the formatted input
                onChangeText={(text) => {
                  // Remove spaces and trim the input
                  const cleanedText = text.replace(/\s+/g, "").trim();
                
                  // Filter out any non-alphabetic characters except commas
                  const validText = cleanedText.replace(/[^a-zA-Z,-]/g, "");
                
                  // Split the input by commas
                  const words = validText.split(",");
                
                  // If there are more than 3 words, limit the input to the first 3 words
                  if (words.length > 3) {
                    setPetPersonality(words.slice(0, 3).join(", "));
                  } else {
                    // Update state with the valid input
                    setPetPersonality(words.join(", "));
                  }
                }}
                
                style={[
                  styles.input,
                  errors.petPersonality && styles.errorInput,
                ]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="#68C2FF"
              />
              {errors.petPersonality && (
                <Text style={styles.errorText}>{errors.petPersonality}</Text>
              )}

              <Text style={styles.question}>Briefly describe this pet:</Text>
              <TextInput
                placeholder="Provide a brief description of this pet's characteristics"
                label="Provide a brief description of this pet's characteristics"
                value={petDescription}
                onChangeText={setPetDescription}
                style={[
                  styles.input,
                  styles.textArea,
                  errors.petDescription && styles.errorInput,
                ]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="#68C2FF"
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
                label="Mention if the pet has any history of illness (or write None)"
                value={petIllnessHistory}
                onChangeText={setPetIllnessHistory}
                style={[
                  styles.input,
                  styles.textArea,
                  errors.petIllnessHistory && styles.errorInput,
                ]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="#68C2FF"
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

              <Text style={styles.question}>Enter adoption fee:</Text>
              <TextInput
                placeholder="e.g., ₱0 - ₱500"
                label="e.g., ₱0 - ₱500"
                value={adoptionFee}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  // Remove any non-numeric characters (except for the peso symbol)
                  const cleanedText = text.replace(/[^0-9]/g, "");
                
                  // If the cleaned text is empty (i.e., user erased everything), set to "₱0"
                  if (cleanedText === "") {
                    setAdoptionFee("");
                    return;
                  }
                
                  // Convert to number
                  let number = parseInt(cleanedText, 10);
                
                  // Ensure the number is between 0 and 500
                  if (number > 500) {
                    number = 500; // Set the number to 500 if it's greater than 500
                  } else if (number < 0) {
                    number = 0; // Set the number to 0 if it's less than 0
                  }
                
                  // Update the state with the formatted value, prefixing with the peso symbol
                  setAdoptionFee(number === 0 ? "₱0" : `₱${number}`);
                }}                       
                style={[styles.input, errors.adoptionFee && styles.errorInput]}
                mode="outlined"
                outlineColor="transparent"
                activeOutlineColor="#68C2FF"
              />
              {errors.adoptionFee && (
                <Text style={styles.errorText}>{errors.adoptionFee}</Text>
              )}

              <Text style={styles.question}>Enter adoption fee:</Text>
                <TextInput
                  placeholder="e.g., ₱0 - ₱500"
                  value={adoptionFee}
                  onChangeText={setAdoptionFee}
                  style={[styles.input, errors.adoptionFee && styles.errorInput]}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="#68C2FF"
                />
                {errors.adoptionFee && (
                  <Text style={styles.errorText}>{errors.adoptionFee}</Text>
                )}

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

            {/* Dialog for Alert */}
            <Portal>
              <Dialog visible={dialogVisible} onDismiss={hideDialog}>
                <Dialog.Icon icon="exclamation-thick" color="#EF5B5B" />
                <Dialog.Title style={styles.dialogTitle}>Alert</Dialog.Title>
                <Dialog.Content style={styles.dialogContent}>
                  <Text style={styles.dialogText}>
                    Please complete all fields before proceeding.
                  </Text>
                </Dialog.Content>
                <Dialog.Actions style={styles.dialogActions}>
                  <TouchableOpacity
                    onPress={hideDialog}
                    style={styles.dialogButton}
                  >
                    <Text style={styles.dialogButtonText}>Okay</Text>
                  </TouchableOpacity>
                </Dialog.Actions>
              </Dialog>
            </Portal>
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
    marginTop: 35,
    fontFamily: "Lato",
    fontSize: 18,
  },
  input: {
    marginTop: 10,
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
    width: "100%",
    height: "50",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
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
  //dialog
  dialogTitle: {
    textAlign: "center", // Center align the title
    fontFamily: "Lato",
    fontSize: 30,
  },
  dialogContent: {
    alignItems: "center", // Center align the content
    justifyContent: "center", // Center vertically
  },
  dialogText: {
    textAlign: "center",
    fontSize: 15,
  },
  dialogActions: {
    justifyContent: "center", // Center align the actions (button)
    alignItems: "center", // Center horizontally
  },
  dialogButton: {
    backgroundColor: "#68C2FF", // Set the background color
    width: 150, // Set the width of the button
    height: 50, // Set the height of the button
    borderRadius: 25, // Set the border radius for rounded corners
    justifyContent: "center", // Center align text inside button
    alignItems: "center", // Center align text inside button
  },
  dialogButtonText: {
    textAlign: "center",
    fontSize: 15,
    color: "white",
    fontFamily: "Lato",
  },
});

export default List;
