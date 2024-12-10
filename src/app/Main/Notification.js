import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase"; // Ensure db is properly initialized
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment'; // Import moment.js for time formatting

const Notification = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [adopters, setAdopters] = useState({}); // Store adopter details
  const [currentUser, setCurrentUser] = useState(null); // Store current logged-in user

  // Get current user
  useEffect(() => {
    const user = auth.currentUser; // Get the current authenticated user
    setCurrentUser(user); // Set the logged-in user
  }, []);

  useEffect(() => {
    if (!currentUser) return; // Skip fetching notifications if user is not logged in
  
    const fetchNotifications = async () => {
      console.log('Fetching pet requests...'); // Debugging log
      const petRequestsQuery = query(
        collection(db, "pet_request"),
        where("status", "==", "Pending"),
        where("listedBy", "==", currentUser.email) // Filter pet requests by the logged-in user's email
      );
      const querySnapshot = await getDocs(petRequestsQuery);
  
      const notificationsList = [];
  
      // Loop through each request
      for (const doc of querySnapshot.docs) {
        const petRequest = doc.data();
   
        // Fetch adopter details for each request if not already fetched
        if (!adopters[petRequest.adopterEmail]) {
          const adopterDetails = await fetchAdopterDetails(petRequest.adopterEmail);
          if (adopterDetails) {
            setAdopters((prev) => ({
              ...prev,
              [petRequest.adopterEmail]: adopterDetails
            }));
          }
        }
  
        const adopter = adopters[petRequest.adopterEmail] || {}; // Get adopter details if available
        const formattedTime = moment(petRequest.requestDate.seconds * 1000).fromNow(); // Format time using moment.js
  
        // Add notification if adopter details are available
        if (adopter.name && adopter.profilePicture) {
          // Generate random adjective only once per notification
          const randomAdjective = getRandomAdjective();
  
          notificationsList.push({
            id: doc.id,
            image: adopter.profilePicture ? { uri: adopter.profilePicture } : null,
            name: adopter.name || "Adopter", // Default name if not loaded
            content: `A ${randomAdjective} ${adopter.name || "Adopter"} has requested to adopt your pet.`,
            time: formattedTime, // Add the formatted time
            action: () => router.push({ pathname: "/Screening", params: { adopterEmail: petRequest.adopterEmail, petRequestId: doc.id } })
          });
        } else {
          console.log('Skipping notification due to missing name or profile image'); // Log if missing data
        }
      }
  
      setNotifications(notificationsList);
    };
  
    fetchNotifications();
  }, [currentUser, adopters]); // Re-run when currentUser or adopters data changes
  

  const fetchAdopterDetails = async (adopterEmail) => {
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", adopterEmail)
      );
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
       
        return {
          name: userDoc.name,
          profilePicture: userDoc.profilePicture || null
        };
      } else {
        console.log("Adopter not found for email:", adopterEmail);
        return null;
      }
    } catch (error) {
      console.error("Error fetching adopter details: ", error);
      return null;
    }
  };


  const adjectives = ["wild", "curious", "bold", "determined", "passionate", "clever", "warm", "generous", "fearless", "playful", "mighty", "vigilant", "wise", "noble", "humble",
    "lively", "radiant", "gracious","charming",];

  const getRandomAdjective = () => {
    // Filter adjectives that start with consonants (excluding vowels)
    const consonantAdjectives = adjectives.filter(adj => !/^[aeiou]/i.test(adj));

    const randomIndex = Math.floor(Math.random() * consonantAdjectives.length); // Random index from filtered adjectives array
    return consonantAdjectives[randomIndex]; // Return the selected adjective
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {notifications.length === 0 ? (
          <Text>No notifications available</Text>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id}>
              <TouchableOpacity
                style={styles.notifButton}
                onPress={notif.action}
                disabled={!notif.action} // Disable click if no action
              >
                {notif.image ? (
                  <Image style={styles.notifImage} source={notif.image} />
                ) : (
                  <View style={styles.iconContainer}>
                    <FontAwesome name="user-circle" size={40} color="#fff" />
                  </View>
                )}
                <View style={styles.notifTextContainer}>
                  <Text style={styles.notifName}>{notif.name}</Text>
                  <Text style={styles.notifContent}>{notif.content}</Text>
                </View>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </TouchableOpacity>

              <View style={styles.horizontalLine}></View>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  notifButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  notifImage: {
    width: 70,
    height: 70,
  },
  notifTextContainer: {
    flexDirection: "column",
    width: "60%",
    marginLeft: 10,
  },
  notifName: {
    fontFamily: "LatoBold",
    fontSize: 16,
  },
  notifContent: {
    fontFamily: "Lato",
    fontSize: 14,
  },
  notifTime: {
    fontFamily: "Lato",
    fontSize: 12,
    marginRight: 15,
    color: '#68C2FF',
  },
  horizontalLine: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "black",
    alignSelf: "stretch",
  },
});

export default Notification;
