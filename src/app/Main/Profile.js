import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const Profile = () => {
  // Get parameters from URL (params)
  const { userName, userEmail, userContactNumber, livingSpace, ownedPets } = useLocalSearchParams();

  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [profileInfo, setProfileInfo] = useState({
    name: userName || "User", // Default name if no param
    email: userEmail || "-", // Default email
    phone: userContactNumber || "-", // Default phone
    address: '', // Default address if not provided
    houseType: livingSpace || "Not Indicated", // Default house type
    hasPet: ownedPets || "Not Indicated", // Default pet info
  });

  const [editableInfo, setEditableInfo] = useState(profileInfo); // Temporary editable state

  // Handle Save
  const handleSave = () => {
    setProfileInfo(editableInfo);
    setModalVisible(false);
    Alert.alert('Profile Updated', 'Your profile information has been saved.');
  };

  // Handle Edit
  const handleEditPress = () => {
    setEditableInfo(profileInfo); // Reset editable info to current profile
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Edit Button */}
      <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
        <Icon name="edit" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          style={styles.profileImage}
          source={require('../../assets/Profile/dp.png')}
        />
        <Text style={styles.profileName}>{profileInfo.name}</Text>
        <Text style={styles.profileStatus}>Active • Devoted Pet Owner</Text>
      </View>

      {/* Profile Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Icon name="email" size={20} color="#007bff" style={styles.icon} />
          <Text style={styles.detailText}>{profileInfo.email}</Text>
        </View>
        <View style={styles.line} />

        <View style={styles.detailItem}>
          <Icon name="phone" size={20} color="#007bff" style={styles.icon} />
          <Text style={styles.detailText}>{profileInfo.phone}</Text>
        </View>
        <View style={styles.line} />

        <View style={styles.detailItem}>
          <Icon name="location-on" size={20} color="#007bff" style={styles.icon} />
          <Text style={styles.detailText}>{profileInfo.address || 'No Address Provided'}</Text>
        </View>
        <View style={styles.line} />

        <View style={styles.detailItem}>
          <Icon name="home" size={20} color="#007bff" style={styles.icon} />
          <Text style={styles.detailText}>House Type: {profileInfo.houseType}</Text>
        </View>
        <View style={styles.line} />

        <View style={styles.detailItem}>
          <Icon name="pets" size={20} color="#007bff" style={styles.icon} />
          <Text style={styles.detailText}>Pet Owner: {profileInfo.hasPet}</Text>
        </View>

      </View>

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
    backgroundColor: '#f0f0f0',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 15,
    padding: 8,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileStatus: {
    color: '#007bff',
    fontSize: 14,
    marginTop: 5,
  },
  details: {
    width: '90%',
    alignSelf: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  icon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
  line: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default Profile;