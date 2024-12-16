import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // Import the Picker
import { auth, signOut, db } from "../../../firebase"; // Ensure this imports your Firebase setup
import {
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  const router = useRouter();
  const [profileInfo, setProfileInfo] = useState({
    name: "Loading...",
    email: "-",
    phone: "-",
    address: "",
    houseType: "Not Indicated",
    hasPet: "Not Indicated",
    bio: "", // Add bio field here
  });

  const [editableInfo, setEditableInfo] = useState(profileInfo);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLogoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [isEditConfirmVisible, setEditConfirmVisible] = useState(false);
  const houseTypeOptions = ["Apartment/Condo", "House"];
  const petOptions = ["Yes", "No"];
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressEmpty, setIsAddressEmpty] = useState(false);
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetch user data from the "users" collection
          const usersCollectionRef = collection(db, "users");
          const q = query(usersCollectionRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              // Fetch lifestyle data based on the user's email
              const lifestyleCollectionRef = collection(db, "lifestyle");
              const lifestyleQuery = query(
                lifestyleCollectionRef,
                where("email", "==", user.email)
              );
              getDocs(lifestyleQuery).then((lifestyleSnapshot) => {
                if (!lifestyleSnapshot.empty) {
                  lifestyleSnapshot.forEach((lifestyleDoc) => {
                    const lifestyleData = lifestyleDoc.data();
                    setProfileInfo((prevState) => ({
                      ...prevState,
                      houseType: lifestyleData.livingSpace || "Not Indicated",
                      hasPet: lifestyleData.ownedPets || "Not Indicated",
                    }));
                    setEditableInfo((prevState) => ({
                      ...prevState,
                      houseType: lifestyleData.livingSpace || "Not Indicated",
                      hasPet: lifestyleData.ownedPets || "Not Indicated",
                    }));
                  });
                }
              });

              // Set the profile data including bio
              setProfileInfo({
                ...userData,
                phone: userData.contactNumber || "-",
                profilePicture: userData.profilePicture || null, // Fetch profile picture URL
                bio: userData.bio || "", // Fetch bio field
              });
              setEditableInfo({
                ...userData,
                phone: userData.contactNumber || "-",
                profilePicture: userData.profilePicture || null, // Fetch profile picture URL
                bio: userData.bio || "", // Fetch bio field
              });
            });
          } else {
            console.log("No such user!");
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };
    fetchUserData();
  }, []); // Empty dependency array, will run once when component mounts

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple clicks

    setIsSaving(true); // Start the loading state
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const updatedData = {
          ...editableInfo,
          contactNumber: editableInfo.phone,
          bio: editableInfo.bio, // Save bio field
        };

        // Upload profile picture if exists
        if (editableInfo.image?.uri) {
          const fileName = `profilePictures/${user.uid}/profile.jpg`;
          const storageRef = ref(storage, fileName);
          try {
            const response = await fetch(editableInfo.image.uri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            updatedData.profilePicture = downloadURL;
            setProfileInfo((prev) => ({
              ...prev,
              profilePicture: downloadURL,
            }));
          } catch (error) {
            console.error("Error uploading profile picture: ", error);
            alert("Profile picture upload failed. Please try again.");
            setIsSaving(false);
            return;
          }
        }

        // Upload cover photo if exists
        if (coverImage?.uri) {
          const coverFileName = `coverPhotos/${user.uid}/cover.jpg`;
          const coverStorageRef = ref(storage, coverFileName);
          try {
            const coverResponse = await fetch(coverImage.uri);
            const coverBlob = await coverResponse.blob();
            await uploadBytes(coverStorageRef, coverBlob);
            const coverDownloadURL = await getDownloadURL(coverStorageRef);
            updatedData.coverPhoto = coverDownloadURL; // Add cover photo URL
            setProfileInfo((prev) => ({
              ...prev,
              coverPhoto: coverDownloadURL, // Update profile info state
            }));
          } catch (error) {
            console.error("Error uploading cover photo: ", error);
            alert("Cover photo upload failed. Please try again.");
            setIsSaving(false);
            return;
          }
        }

        await updateDoc(userRef, updatedData); // Update Firestore document with all changes
        setProfileInfo(updatedData);
        setEditConfirmVisible(false);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error saving profile data: ", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false); // End the loading state
    }

    if (!editableInfo.address) {
      setIsAddressEmpty(true); // Set state to true if address is empty
    } else {
      setIsAddressEmpty(false); // Clear the validation if address is filled
    }
  };

  const handleEditPress = () => {
    setEditableInfo(profileInfo);
    setModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditConfirmVisible(false);
  };

  const storage = getStorage(); // Initialize Firebase Storage

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const imageUri = pickerResult.assets[0].uri;
      setEditableInfo((prevState) => ({
        ...prevState,
        image: { uri: imageUri },
      }));
    }
  };
  const pickCoverImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Aspect ratio for cover photo
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const imageUri = pickerResult.assets[0].uri;
      setCoverImage({ uri: imageUri }); // Store cover image URI
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Icon name="edit" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            {/* Cover Photo */}
            <Image
              style={styles.coverImage}
              source={
                profileInfo.coverPhoto
                  ? { uri: profileInfo.coverPhoto } // Use the cover photo URL from Firestore
                  : coverImage?.uri
                  ? { uri: coverImage.uri } // Temporary cover photo if selected
                  : require("../../assets/Profile/defaultcover.jpg") // Default cover photo
              }
            />

            <Image
              style={styles.profileImage}
              source={
                profileInfo.profilePicture
                  ? { uri: profileInfo.profilePicture } // Firebase Storage URL
                  : require("../../assets/Profile/dp.png") // Default image
              }
            />

            <Text style={styles.profileName}>{profileInfo.name}</Text>
            <Text style={styles.bioText}>{profileInfo.bio || "Add bio"}</Text>
          </View>

          {/* Profile Details */}
          <View style={styles.detailsContainer}>
            <Icon name="email" size={24} color="#444444" />
            <Text style={styles.detailsText}>{profileInfo.email}</Text>
          </View>
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon name="phone" size={24} color="#444444" />
            <Text style={styles.detailsText}>{profileInfo.phone}</Text>
          </View>
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon name="location-on" size={24} color="#444444" />
            <Text style={styles.detailsText}>
              {profileInfo.address || "No Address Provided"}
            </Text>
          </View>
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon name="home" size={24} color="#444444" />
            <Text style={styles.detailsText}>
              House Type: {profileInfo.houseType}
            </Text>
          </View>
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon name="pets" size={24} color="#444444" />
            <Text style={styles.detailsText}>
              Pet Owner: {profileInfo.hasPet}
            </Text>
          </View>
          <View style={styles.horizontalLine}></View>

          {/* Edit Modal */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                <ScrollView contentContainerStyle={styles.scrollViewContent2}>
                  <View style={styles.uploadContainer}>
                    <TouchableOpacity
                      style={styles.pickCoverImage}
                      onPress={pickCoverImage}
                    >
                      <Image
                        style={styles.coverImage}
                        source={
                          editableInfo.coverImage
                            ? { uri: editableInfo.coverImage } // Use the saved cover photo if available
                            : coverImage?.uri
                            ? { uri: coverImage.uri } // Temporary cover photo if selected
                            : require("../../assets/Profile/defaultcover.jpg") // Default cover photo
                        }
                      />
                      <TouchableOpacity
                        style={styles.editcoverImage}
                        onPress={pickCoverImage}
                      >
                        <Icon name="edit" size={20} color="white" />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.profileImageContainer}
                      onPress={pickImage}
                    >
                      <Image
                        style={styles.profileImage}
                        source={
                          editableInfo.image?.uri
                            ? { uri: editableInfo.image.uri } // Use the temporary URI selected by the user
                            : profileInfo.profilePicture
                            ? { uri: profileInfo.profilePicture } // Use saved profile picture from Firestore
                            : require("../../assets/Profile/dp.png") // Default image if no profile picture
                        }
                      />
                      <TouchableOpacity
                        style={styles.editProfileImage}
                        onPress={pickImage}
                      >
                        <Icon name="edit" size={20} color="white" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                  {/* Other Input Fields */}

                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={editableInfo.name}
                    onChangeText={(text) =>
                      setEditableInfo({ ...editableInfo, name: text })
                    }
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="#68C2FF"
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Bio"
                    value={editableInfo.bio}
                    onChangeText={(text) =>
                      setEditableInfo({ ...editableInfo, bio: text })
                    }
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="#68C2FF"
                    autoCapitalize="sentences"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={editableInfo.email}
                    onChangeText={(text) =>
                      setEditableInfo({ ...editableInfo, email: text })
                    }
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="#68C2FF"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={editableInfo.phone}
                    onChangeText={(text) =>
                      setEditableInfo({ ...editableInfo, phone: text })
                    }
                    keyboardType="number-pad"
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="#68C2FF"
                    autoCapitalize="sentences"
                  />
                  <TextInput
                    placeholder="Address"
                    value={editableInfo.address}
                    onChangeText={(text) =>
                      setEditableInfo({ ...editableInfo, address: text })
                    }
                    style={[styles.input, isAddressEmpty && styles.inputError]}
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="#68C2FF"
                    autoCapitalize="sentences"
                  />
                  {isAddressEmpty && (
                    <Text style={styles.errorText}>Address is required</Text>
                  )}

                  <View style={styles.input2}>
                    <Picker
                      selectedValue={editableInfo.houseType}
                      onValueChange={(value) =>
                        setEditableInfo((prevState) => ({
                          ...prevState,
                          houseType: value,
                        }))
                      }
                    >
                      {houseTypeOptions.map((option) => (
                        <Picker.Item
                          key={option}
                          label={option}
                          value={option}
                          style={styles.pickerItemText}
                        />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.input2}>
                    <Picker
                      selectedValue={editableInfo.hasPet}
                      onValueChange={(value) =>
                        setEditableInfo((prevState) => ({
                          ...prevState,
                          hasPet: value,
                        }))
                      }
                    >
                      {petOptions.map((option) => (
                        <Picker.Item
                          key={option}
                          label={option}
                          value={option}
                          style={styles.pickerItemText}
                        />
                      ))}
                    </Picker>
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
                    onPress={() => setEditConfirmVisible(true)}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Edit Confirmation Modal */}
          <Modal
            visible={isEditConfirmVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleCancelEdit}
          >
            <View style={styles.logoutModalContainer}>
              <View style={styles.logoutModalContent}>
                <Text style={styles.logoutModalText}>
                  Are you sure you want to save changes?
                </Text>
                <View style={styles.logoutModalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.logoutButtonModal,
                      isSaving && { opacity: 0.5 },
                    ]} // Add opacity for visual feedback
                    onPress={handleSave}
                    disabled={isSaving} // Disable button during loading
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    paddingBottom: 5,
  },
  container: {
    width: "100%",
    flexDirection: "column",
    padding: 20,
  },
  editButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#444444",
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  profileName: {
    fontFamily: "Lilita",
    fontSize: 24,
    textAlign: "center",
    marginTop: 10,
  },
  profileStatus: {
    fontFamily: "Lilita",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 50,
    color: "#68C2FF",
  },
  detailsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  detailsText: {
    fontFamily: "Lato",
    fontSize: 16,
    marginLeft: 20,
  },
  horizontalLine: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "gray",
    alignSelf: "center",
  },
  logoutButton: {
    width: 150,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#EF5B5B",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  logoutText: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "white",
    alignSelf: "center",
  },
  scrollViewContent2: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "100%", // Adjust the width as needed
    maxHeight: "100%", // Restrict height of the modal content
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 20,
  },
  input: {
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: "#F5F5F5",
  },
  input2: {
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 5,
    backgroundColor: "#F5F5F5",
    fontSize: 16,
    borderRadius: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 14,
  },
  pickerItemText: {
    fontFamily: "Lato",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 20,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "#68C2FF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  logoutModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  logoutModalContent: {
    width: "80%",
    backgroundColor: "#68C2FF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  logoutModalText: {
    fontSize: 18,
    fontFamily: "Lilita",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  logoutModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  logoutButtonModal: {
    backgroundColor: "#EF5B5B",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  uploadContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageContainer: {
    width: 244,
    height: 244,
    borderRadius: 122,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  profileImage: {
    width: 240,
    height: 240,
    borderRadius: 120, // Ensures the image is circular
    borderColor: "#68C2FF",
    borderWidth: 5,
  },
  editProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#68C2FF",
    zIndex: 1,
    marginLeft: 150,
    marginTop: -50,
  },
  coverImage: {
    width: "115%",
    height: 210, // Adjust as needed
    resizeMode: "cover",
    marginBottom: 10,
    marginTop: -20, // Space below cover photo
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 244,
    height: 244,
    borderRadius: 122,
    borderWidth: 3,
    borderColor: "#68C2FF",
    marginTop: -130, // Overlaps cover photo
  },
  profileStatus: {
    fontSize: 14,
    color: "#6C757D",
    marginTop: 5,
  },
  bioText: {
    fontSize: 16,
    fontFamily: "Lilita",
    color: "#68C2FF",
    textAlign: "center",
    marginVertical: 30,
    marginBottom: -5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
  pickCoverImage: {
    width: "100%",
    marginLeft: -65,
  },
});

export default Profile;
