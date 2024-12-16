import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RadioButton } from "react-native-paper";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

// Reusable Transaction Card Component
const TransactionCard = ({ status, trackingNumber, petName, destination, onUpdateStatus }) => {
  const statusStyles = {
    ToShip: { backgroundColor: "#FFB366", text: "To Ship" },
    Delivered: { backgroundColor: "#5DB075", text: "Delivered" },
    Canceled: { backgroundColor: "#E75D5D", text: "Canceled" },
  };

  const currentStatusStyle = statusStyles[status] || statusStyles["ToShip"];

  return (
    <View style={styles.transactionCard}>
      <Text style={styles.cardText}>
        <Text style={styles.cardLabel}>Current Status: </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: currentStatusStyle.backgroundColor }]}>
          <Text style={styles.statusText}>{currentStatusStyle.text}</Text>
        </View>
      </Text>
      <Text style={styles.cardText}>
        <Text style={styles.cardLabel}>Tracking Number: </Text>
        {trackingNumber}
      </Text>
      <Text style={styles.cardText}>
        <Text style={styles.cardLabel}>Pet Name: </Text>
        {petName}
      </Text>
      <Text style={styles.cardText}>
        <Text style={styles.cardLabel}>Destination: </Text>
        {destination}
      </Text>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={onUpdateStatus}
      >
        <Text style={styles.updateButtonText}>Update Status</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ManageTrack() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const navigation = useNavigation(); // Initialize navigation

  const handleSearch = () => {
    console.log("Search term:", searchQuery);
  };

  const handleUpdateStatus = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const handleLogout = () => {
    // Navigate to the Login screen when logout is pressed
    navigation.navigate("Login");
  };

  const transactions = [
    {
      status: "ToShip",
      trackingNumber: "ABC123456",
      petName: "Shiro",
      destination: "Recipient's Address",
    },
    {
      status: "Delivered",
      trackingNumber: "DEF789101",
      petName: "Buddy",
      destination: "Another Address",
    },
    {
      status: "Canceled",
      trackingNumber: "GHI112233",
      petName: "Max",
      destination: "Nearby Shelter",
    },
    {
      status: "Delivered",
      trackingNumber: "JKL112233",
      petName: "Elsa",
      destination: "Another Address",
    },
  ];

  return (
    <View style={styles.container}> 

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={24} color="#444" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#C2C2C2"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      {/* Title */}
      <Text style={styles.transactionListTitle}>Transaction List</Text>

      {/* Transaction Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {transactions.map((item, index) => (
          <TransactionCard
            key={index}
            status={item.status}
            trackingNumber={item.trackingNumber}
            petName={item.petName}
            destination={item.destination}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </ScrollView>

      {/* Modal for Update Status */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={handleCloseModal}
        />
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Update Status</Text>
          <View style={styles.statusOptions}>
            <RadioButton.Group
              onValueChange={(newValue) => handleStatusChange(newValue)}
              value={selectedStatus}
            >
              {["Preparing", "Shipped", "In Transit", "In Delivery", "Delivered", "Canceled"].map(
                (status, index) => (
                  <View key={index} style={styles.radioContainer}>
                    <RadioButton value={status} color="#68C2FF" />
                    <Text style={styles.statusOptionText}>{status}</Text>
                  </View>
                )
              )}
            </RadioButton.Group>
          </View>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => {
              console.log("Status Updated to: ", selectedStatus);
              handleCloseModal();
            }}
          >
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  logoutButton: {
    backgroundColor: "#EF5B5B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "88%",
    alignSelf: "center",
    marginTop: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#444",
  },
  transactionListTitle: {
    fontSize: 24,
    fontFamily: "Lilita",
    color: "#68C2FF",
    marginTop: 40,
    marginBottom: 10,
    textAlign: "center",
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  transactionCard: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  cardLabel: {
    fontWeight: "bold",
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    paddingLeft: 20,
    paddingRight: 20,
  },
  updateButton: {
    backgroundColor: "#68C2FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 25,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Lilita",
  },
  modalContainer: {
    position: "absolute",
    top: "30%",
    left: "10%",
    width: "80%",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Lilita",
    color: "#68C2FF",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
  },
  statusOptions: {
    marginBottom: 50,
  },
  statusOptionText: {
    fontSize: 16,
    color: "#444",
  },
  proceedButton: {
    backgroundColor: "#EF5B5B",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 20,
    alignSelf: "center",
  },
  proceedButtonText: {
    color: "white",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
});
