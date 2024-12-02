import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function ApprovedAdoption({ route }) {
  const router = useRouter();
  
  // State for adopter and delivery details
  const [adopterDetails, setAdopterDetails] = useState({
    name: "Mary Jane",
    contactNumber: "0984 174 2482",
    address: "123 ABC Street, Barangay Carmen, Cagayan de Oro City, Misamis Oriental, 9000, Philippines",
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    type: "Standard Delivery",
    expectedDate: "20 - 23 Dec",
    cost: 360.4,
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");

  const [transactionSummary, setTransactionSummary] = useState([
    { title: "Adoption Fee", amount: 0 },
    { title: "Transportation Cost", amount: 360.4 },
    { title: "Convenience Fee", amount: 200 },
  ]);

  // Modal visibility and selected delivery type state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("Standard Delivery");

  useEffect(() => {
    // Example: Fetch data dynamically here if needed
    // setAdopterDetails(fetchAdopterDetails());
    // setDeliveryDetails(fetchDeliveryDetails());
    // setTransactionSummary(fetchTransactionSummary());
  }, []);

  const calculateTotal = () => {
    return transactionSummary.reduce((total, item) => total + item.amount, 0);
  };

  // Handle delivery option selection
  const handleDeliveryOptionSelect = (option) => {
    setSelectedDeliveryType(option);
    setModalVisible(false); // Close modal after selection
  };

  const handlePaidAdoption = () => {
    router.push('PaidAdoption')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Back Button */}
          <View style={styles.buttonTitleImageContainer}>
            <View style={styles.backButtonContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.titleText}>Ready to adopt Shiro?</Text>
            <Image
              source={require("../assets/Notification/petImage.jpg")}
              style={styles.petImage}
            />
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          {/* Adopter Details */}
          <View style={styles.adopterDetailsButton}>
            <View style={styles.adopterDetailsContainer}>
              <View style={styles.row}>
                <Text style={styles.adopterName}>{adopterDetails.name}</Text>
                <Text style={styles.adopterContactNumber}>
                  {adopterDetails.contactNumber}
                </Text>
              </View>
              <Text style={styles.adopterAddress}>{adopterDetails.address}</Text>
            </View>
            <TouchableOpacity style={styles.nextButton}>
              <MaterialIcons name="navigate-next" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          {/* Delivery Option */}
          <View style={styles.deliveryPaymentContainer}>
            <View style={styles.deliveryContainer}>
              <Text style={styles.deliveryText}>Delivery Option</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={styles.optionsText}>View all options {">"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.deliveryInfoMainContainer}>
              <View style={styles.deliveryInfoContainer}>
                <Text style={styles.deliveryTypeText}>
                  {selectedDeliveryType}
                </Text>
                <View style={styles.truckDateContainer}>
                  {selectedDeliveryType === "Motor Delivery" ? (
                    <FontAwesome5 name="motorcycle" size={16} color="black" />
                  ) : (
                    <FontAwesome5 name="truck" size={16} color="black" />
                  )}
                  <Text style={styles.expectedDeliveryDateText}>
                    Receive By {deliveryDetails.expectedDate}
                  </Text>
                </View>
              </View>
              <Text style={styles.deliveryAmountText}>
                ₱{deliveryDetails.cost.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentMainContainer}>
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentText}>Payment Method</Text>
            </View>
            <View style={styles.paymentInfoMainContainer}>
              <Text style={styles.paymentTypeText}>{paymentMethod}</Text>
            </View>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          {/* Transaction Summary */}
          <View style={styles.transactionSummaryMainContainer}>
            <View style={styles.transactionSummaryContainer}>
              {transactionSummary.map((item, index) => (
                <View style={styles.transactionTextContainer} key={index}>
                  <Text style={styles.titleSummaryText}>{item.title}</Text>
                  <Text style={styles.amountSummaryText}>
                    ₱{item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
              <View style={styles.transactionTextContainer}>
                <Text style={styles.titleSummaryText}>Total VAT included</Text>
                <Text style={styles.amountSummaryText}>
                  ₱{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Horizontal Line */}
          <View style={styles.horizontalLine}></View>

          {/* Payment Section */}
          <View style={styles.paymentSectionContainer}>
            <Text style={styles.paymentTotalText}>
              Total: ₱{calculateTotal().toFixed(2)}
            </Text>
            <TouchableOpacity style={styles.payButton} onPress={handlePaidAdoption}>
              <Text style={styles.payButtonText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Delivery Options */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}></View>
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Delivery Option</Text>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleDeliveryOptionSelect("Car Delivery")}
          >
            <Text style={styles.modalOptionText}>Car</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleDeliveryOptionSelect("Motor Delivery")}
          >
            <Text style={styles.modalOptionText}>Motor</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  },
  buttonTitleImageContainer: {
    flex: 1,
    padding: 20,
  },
  backButtonContainer: {
    backgroundColor: "gray",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  titleText: {
    fontSize: 24,
    color: "#68C2FF",
    marginBottom: 20,
    fontFamily: "Lilita",
    marginBottom: 30,
  },
  petImage: {
    width: "100%",
    height: 342,
    borderRadius: 20,
    marginBottom: 20,
  },
  horizontalLine: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "gray",
    alignSelf: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 0.3,
    backgroundColor: "white",
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontFamily: "LatoBold",
    fontSize: 18,
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalOptionText: {
    fontFamily: "Lato",
    fontSize: 16,
  },
  adopterDetailsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },
  adopterDetailsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  adopterName: {
    fontFamily: "LatoBold",
    fontSize: 16,
    color: "#000",
  },
  adopterContactNumber: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "#888",
    marginLeft: 20,
  },
  adopterAddress: {
    fontFamily: "Lato",
    fontSize: 16,
  },
  nextButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center", // Centers horizontally
    justifyContent: "center", // Centers vertically
    elevation: 3,
  },
  deliveryPaymentContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
  },
  deliveryContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  deliveryText: {
    fontFamily: "LatoBold",
    fontSize: 16,
  },
  optionsText: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "#68C2FF",
  },
  deliveryInfoMainContainer: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#F3F3F3",
    padding: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryInfoContainer: {
    flex: 1,
  },
  deliveryTypeText: {
    fontFamily: "LatoBold",
    fontSize: 16,
  },
  truckDateContainer: {
    flex: 1,
    flexDirection: "row",
  },
  expectedDeliveryDateText: {
    fontFamily: "Lato",
    fontSize: 16,
    marginLeft: 10,
  },
  deliveryAmountText: {
    fontFamily: "LatoBold",
    fontSize: 16,
  },
  paymentMainContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
  },
  paymentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentText: {
    fontFamily: "LatoBold",
    fontSize: 16,
  },
  optionsText: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "#68C2FF",
  },
  paymentInfoMainContainer: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#F3F3F3",
    padding: 20,
    borderRadius: 10,
  },
  paymentTypeText: {
    fontFamily: "Lato",
    fontSize: 16,
  },
  transactionSummaryMainContainer: {
    width: "100%",
    flexDirection: 'column',
  },
  transactionSummaryContainer: {
    flex: 1,
    padding: 20,
  },
  transactionTextContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  titleSummaryText: {
    fontFamily: "Lato",
    fontSize: 16,
  },
  amountSummaryText: {
    fontFamily: "LatoBold",
    fontSize: 16,
  },
  paymentSectionContainer: {
    flex: 1,
    marginTop: 70,
    backgroundColor: '#68C2FF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  paymentTotalText: {
    fontFamily: "LatoBold",
    fontSize: 16,
    color: 'white',
    marginRight: 20,
  },
  payButton: {
    width: 90,
    height: 50,
    backgroundColor: '#EF5B5B',
    borderRadius: 25,
    justifyContent: 'center',
  },
  payButtonText: {
    fontFamily: "LatoBold",
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});
