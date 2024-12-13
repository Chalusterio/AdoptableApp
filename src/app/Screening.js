import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { query, where, getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure db is initialized
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Screening() {
  const navigation = useNavigation();
  const route = useRoute(); // Use useRoute to get the params
  const { adopterEmail, petRequestId, petName } = route.params; // Get parameters from route params
  const [adopter, setAdopter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdopterDetails = async () => {
      try {
        const adopterQuery = query(
          collection(db, "users"),
          where("email", "==", adopterEmail) // Use adopterEmail to query Firestore
        );
        const querySnapshot = await getDocs(adopterQuery);
        if (!querySnapshot.empty) {
          const adopterData = querySnapshot.docs[0].data();
          setAdopter(adopterData); // Set the adopter details
        } else {
          console.log("Adopter not found!");
        }
      } catch (error) {
        console.error("Error fetching adopter details: ", error);
      } finally {
        setLoading(false); // Stop loading after the fetch is done
      }
    };

    fetchAdopterDetails();
  }, [adopterEmail]); // Re-run the effect when adopterEmail changes

  // Function to update the pet request status and store the respective date field
const updatePetRequestStatus = async (status) => {
  try {
    const petRequestRef = doc(db, "pet_request", petRequestId); // Reference to the pet request document
    const actionDate = new Date(); // Get the current date

    const updateData = {
      status: status, // Update the status to either 'accepted' or 'rejected'
    };

    if (status === "Accepted") {
      updateData.acceptDate = actionDate; // Store the acceptance date
    } else if (status === "Rejected") {
      updateData.rejectDate = actionDate; // Store the rejection date
    }

    // Update the document in Firestore
    await updateDoc(petRequestRef, updateData);

    console.log(`Pet request status updated to ${status}`);
  } catch (error) {
    console.error("Error updating pet request status: ", error);
  }
};

  const handleAcceptAdoption = async () => {
    await updatePetRequestStatus("Accepted"); // Update the status to 'accepted'
    navigation.navigate("AcceptAdoption", {
      adopterEmail,
      petRequestId,
      petName, // Pass petName to RejectAdoption
    });
  };

  const handleRejectAdoption = async () => {
    await updatePetRequestStatus("Rejected"); // Update the status to 'rejected'
    navigation.navigate("RejectAdoption", {
      adopterEmail,
      petRequestId,
      petName, // Pass petName to RejectAdoption
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!adopter) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Adopter details not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Back Button */}
          <View style={styles.buttonImageContainer}>
            <View style={styles.backButtonContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()} // Go back to previous screen
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Image
              source={adopter.profilePicture ? { uri: adopter.profilePicture } : require("../assets/Profile/dp.png")}
              style={styles.adopterImage}
            />

            <Text style={styles.adopterName}>{adopter.name}</Text>
            <Text style={styles.profileStatus}>Active • Devoted Pet Owner</Text>

            <View style={styles.detailsContainer}>
              <Icon name="email" size={24} color="#444444" style={styles.icon} />
              <Text style={styles.detailsText}>{adopter.email}</Text>
            </View>

            {/* Horizontal Line */}
            <View style={styles.horizontalLine}></View>

            <View style={styles.detailsContainer}>
              <Icon name="phone" size={24} color="#444444" style={styles.icon} />
              <Text style={styles.detailsText}>{adopter.contactNumber || "Not provided"}</Text>
            </View>

            {/* Horizontal Line */}
            <View style={styles.horizontalLine}></View>

            <View style={styles.detailsContainer}>
              <Icon name="location-on" size={24} color="#444444" style={styles.icon} />
              <Text style={styles.detailsText}>{adopter.address || "Not provided"}</Text>
            </View>

            {/* Horizontal Line */}
            <View style={styles.horizontalLine}></View>

            <View style={styles.detailsContainer}>
              <Icon name="home" size={24} color="#444444" style={styles.icon} />
              <Text style={styles.detailsText}>House</Text>
            </View>

            {/* Horizontal Line */}
            <View style={styles.horizontalLine}></View>

            <View style={styles.detailsContainer}>
              <Icon name="pets" size={24} color="#444444" style={styles.icon} />
              <Text style={styles.detailsText}>Not Provided</Text>
            </View>

            {/* Horizontal Line */}
            <View style={styles.horizontalLine}></View>

            <View style={styles.buttonContainer}>
              {/* Accept Button */}
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptAdoption}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>

              {/* Reject Button */}
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleRejectAdoption}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  buttonImageContainer: {
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
  adopterImage: {
    width: 244,
    height: 244,
    borderRadius: 122,
    alignSelf: "center",
  },
  adopterName: {
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
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  acceptButton: {
    width: 180,
    height: 40,
    borderRadius: 30,
    backgroundColor: "#68C2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "white",
  },
  rejectButton: {
    width: 180,
    height: 40,
    borderRadius: 30,
    backgroundColor: "#EF5B5B",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: {
    fontFamily: "Lato",
    fontSize: 16,
    color: "white",
  },
});
