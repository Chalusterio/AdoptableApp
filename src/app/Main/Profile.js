import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

const Profile = () => {
  // Get parameters from URL (params)
  const { userName, userEmail, userContactNumber, livingSpace, ownedPets } =
    useLocalSearchParams();

  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [profileInfo, setProfileInfo] = useState({
    name: userName || "User", // Default name if no param
    email: userEmail || "-", // Default email
    phone: userContactNumber || "-", // Default phone
    address: "", // Default address if not provided
    houseType: livingSpace || "Not Indicated", // Default house type
    hasPet: ownedPets || "Not Indicated", // Default pet info
  });

  const [editableInfo, setEditableInfo] = useState(profileInfo); // Temporary editable state

  // Handle Save
  const handleSave = () => {
    setProfileInfo(editableInfo);
    setModalVisible(false);
    Alert.alert("Profile Updated", "Your profile information has been saved.");
  };

  // Handle Edit
  const handleEditPress = () => {
    setEditableInfo(profileInfo); // Reset editable info to current profile
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Icon name="edit" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={styles.header}>
            <Image
              style={styles.profileImage}
              source={require("../../assets/Profile/dp.png")}
            />
            <Text style={styles.profileName}>{profileInfo.name}</Text>
            <Text style={styles.profileStatus}>Active • Devoted Pet Owner</Text>
          </View>

          {/* Profile Details */}
          <View style={styles.detailsContainer}>
            <Icon name="email" size={24} color="#444444" style={styles.icon} />
            <Text style={styles.detailsText}>{profileInfo.email}</Text>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon name="phone" size={24} color="#444444" style={styles.icon} />
            <Text style={styles.detailsText}>{profileInfo.phone}</Text>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon
              name="location-on"
              size={24}
              color="#444444"
              style={styles.icon}
            />
            <Text style={styles.detailsText}>
              {profileInfo.address || "No Address Provided"}
            </Text>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon name="home" size={24} color="#444444" style={styles.icon} />
            <Text style={styles.detailsText}>
              House Type: {profileInfo.houseType}
            </Text>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          <View style={styles.detailsContainer}>
            <Icon name="pets" size={24} color="#444444" style={styles.icon} />
            <Text style={styles.detailsText}>
              Pet Owner: {profileInfo.hasPet}
            </Text>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          {/* Edit Profile Modal */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                {/* Editable Fields */}
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={editableInfo.name}
                  onChangeText={(text) =>
                    setEditableInfo({ ...editableInfo, name: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={editableInfo.email}
                  onChangeText={(text) =>
                    setEditableInfo({ ...editableInfo, email: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  value={editableInfo.phone}
                  onChangeText={(text) =>
                    setEditableInfo({ ...editableInfo, phone: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={editableInfo.address}
                  onChangeText={(text) =>
                    setEditableInfo({ ...editableInfo, address: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="House Type"
                  value={editableInfo.houseType}
                  onChangeText={(text) =>
                    setEditableInfo({ ...editableInfo, houseType: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Has a Pet"
                  value={editableInfo.hasPet}
                  onChangeText={(text) =>
                    setEditableInfo({ ...editableInfo, hasPet: text })
                  }
                />

                {/* Modal Buttons */}
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
    paddingBottom: 0,
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
  profileImage: {
    width: 244,
    height: 244,
    borderRadius: 122,
    alignSelf: "center",
    borderColor: "#007bff",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "#007bff",
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
});

export default Profile;
