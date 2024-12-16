import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

// Reusable Transaction Card Component
const TransactionCard = ({ status, petName, address, trackingStatus, onUpdateStatus }) => {
  const statusStyles = {
    Preparing: { backgroundColor: "#FFB366", text: "Preparing" },
    ToShip: { backgroundColor: "#FF8C00", text: "To Ship" },
    Shipped: { backgroundColor: "#ADD8E6", text: "Shipped" },
    InTransit: { backgroundColor: "#4682B4", text: "In Transit" },
    InDelivery: { backgroundColor: "#32CD32", text: "In Delivery" },
    Delivered: { backgroundColor: "#5DB075", text: "Delivered" },
  };

  const currentStatusStyle = statusStyles[trackingStatus] || statusStyles["ToShip"];

  return (
    <View style={styles.transactionCard}>
      <Text style={styles.cardText}>
        <Text style={styles.cardLabel}>Current Status: </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: currentStatusStyle.backgroundColor }]}
        >
          <Text style={styles.statusText}>{currentStatusStyle.text}</Text>
        </View>
      </Text>
      <Text style={styles.cardText}>
        <Text style={styles.cardLabel}>Pet Name: </Text>
        {petName}
      </Text>
      <Text style={styles.cardText}>
        <Text style={styles.cardLabel}>Adopter Address: </Text>
        {address}
      </Text>
      <TouchableOpacity style={styles.updateButton} onPress={onUpdateStatus}>
        <Text style={styles.updateButtonText}>Update Status</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ManageTrack() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTransactions = async () => {
      const db = getFirestore();
      const collectionRef = collection(db, "finalized_adoption");
      const querySnapshot = await getDocs(collectionRef);

      const fetchedTransactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          trackingStatus: data.tracking_status || "ToShip",
          petName: data.petRequestDetails?.petName || "Unknown",
          address: data.petRequestDetails?.address || "No Address Provided",
        };
      });

      setTransactions(fetchedTransactions);
    };

    fetchTransactions();
  }, []);

  const handleUpdateStatus = (id) => {
    setCurrentTransactionId(id);
    setModalVisible(true);
    const currentTransaction = transactions.find((item) => item.id === id);
    setSelectedStatus(currentTransaction?.trackingStatus || "ToShip");
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const handleSaveStatusUpdate = async () => {
    const db = getFirestore();
    const transactionRef = doc(db, "finalized_adoption", currentTransactionId);

    const validStatuses = [
      "Preparing",
      "ToShip",
      "Shipped",
      "InTransit",
      "InDelivery",
      "Delivered",
    ];

    if (!validStatuses.includes(selectedStatus)) {
      alert("Invalid status selected!");
      return;
    }

    try {
      await updateDoc(transactionRef, { tracking_status: selectedStatus });
      setModalVisible(false);
      alert("Status updated successfully!");
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === currentTransactionId
            ? { ...transaction, trackingStatus: selectedStatus }
            : transaction
        )
      );
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status");
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            setMenuVisible(false);
            navigation.navigate("Login"); // Navigate to Login screen
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={24} color="#444" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#C2C2C2"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        <TouchableOpacity onPress={toggleMenu}>
          <Icon name="more-vert" size={30} color="#444" style={styles.moreIcon} />
        </TouchableOpacity>
      </View>

      {/* Three-dot Menu */}
      {isMenuVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItemLogout} onPress={handleLogout}>
            <Text style={styles.menuItemLogoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Title */}
      <Text style={styles.transactionListTitle}>Manage Tracking</Text>

      {/* Transaction Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {transactions.map((item, index) => (
          <TransactionCard
            key={index}
            trackingStatus={item.trackingStatus}
            petName={item.petName}
            address={item.address}
            onUpdateStatus={() => handleUpdateStatus(item.id)}
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
        <TouchableOpacity style={styles.overlay} onPress={handleCloseModal} />
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Update Status</Text>
          <View style={styles.statusOptions}>
            <RadioButton.Group
              onValueChange={handleStatusChange}
              value={selectedStatus}
            >
              {["Preparing", "Shipped", "InTransit", "InDelivery", "Delivered"].map(
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
            onPress={handleSaveStatusUpdate}
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
  moreIcon: {
    marginLeft: 10,
  },
  menuContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    width: 150,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
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
    shadowColor: "#000",
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
    top: "25%",
    left: "10%",
    width: "80%",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    elevation: 5,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Lilita",
    color: "#68C2FF",
    marginBottom: 20,
    textAlign: "center",
  },
  statusOptions: {
    marginBottom: 30,
    flexGrow: 1,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  statusOptionText: {
    fontSize: 16,
    color: "#444",
    marginLeft: 10,
  },
  proceedButton: {
    backgroundColor: "#EF5B5B",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
  },
  proceedButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuItemLogout: {
    padding: 12,
    backgroundColor: "#FF5C5C", // Bright red for logout
    borderRadius: 15,
    marginHorizontal: 2,
  },
  menuItemLogoutText: {
    fontSize: 16,
    color: "#FFFFFF", // White for readability
    textAlign: "center",
    fontWeight: "bold",
  },
  
});
