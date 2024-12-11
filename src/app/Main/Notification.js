import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { collection, query, getDocs, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';

const Notification = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const petRequestsQuery = query(
      collection(db, "pet_request"),
      where("status", "in", ["Pending", "Accepted", "Rejected"]) // Fetch all relevant statuses
    );
    
    const unsubscribe = onSnapshot(petRequestsQuery, async (querySnapshot) => {
      const notificationsList = [];

      querySnapshot.forEach((doc) => {
        const petRequest = doc.data();

        if (!users[petRequest.adopterEmail]) {
          fetchUserDetails(petRequest.adopterEmail).then((userDetails) => {
            if (userDetails) {
              setUsers((prev) => ({
                ...prev,
                [petRequest.adopterEmail]: userDetails,
              }));
            }
          });
        }

        if (!users[petRequest.listedBy]) {
          fetchUserDetails(petRequest.listedBy).then((userDetails) => {
            if (userDetails) {
              setUsers((prev) => ({
                ...prev,
                [petRequest.listedBy]: userDetails,
              }));
            }
          });
        }

        const adopter = users[petRequest.adopterEmail] || {};
        const petLister = users[petRequest.listedBy] || {};
        const formattedTime = moment(petRequest.requestDate.seconds * 1000).fromNow();

        if (petRequest.status === "Pending" && currentUser.email === petRequest.listedBy) {
          // Notifications for Pending requests visible to lister
          notificationsList.push({
            id: doc.id,
            image: adopter.profilePicture ? { uri: adopter.profilePicture } : null,
            name: adopter.name || "Adopter",
            content: (
              <Text>
                {adopter.name || "Adopter"} has requested to adopt your pet <Text style={styles.boldText}>{petRequest.petName}</Text>.
              </Text>
            ),
            time: formattedTime,
            action: () =>
              router.push({
                pathname: "/Screening",
                params: {
                  adopterEmail: petRequest.adopterEmail,
                  petRequestId: doc.id,
                  petName: petRequest.petName,
                },
              }),
          });
        }

        if (petRequest.status === "Accepted" && currentUser.email === petRequest.adopterEmail) {
          // Notifications for Accepted requests visible to adopter
          notificationsList.push({
            id: doc.id,
            image: petLister.profilePicture ? { uri: petLister.profilePicture } : null,
            name: petLister.name || "Pet Lister",
            content: (
              <Text>
                {petLister.name || "Pet Lister"} has accepted your request to adopt <Text style={styles.boldText}>{petRequest.petName}</Text>.
                <Text style={styles.linkText}> {"\n"}Click here for more details.</Text>
              </Text>
            ),
            time: moment().fromNow(), 
            action: () =>
              router.push({
                pathname: "/ApproveAdoption",
                params: {
                  petRequestId: doc.id,
                  petName: petRequest.petName,
                  listedBy: petRequest.listedBy,
                },
              }),
          });
        }

        if (petRequest.status === "Rejected" && currentUser.email === petRequest.adopterEmail) {
          // Notifications for Rejected requests visible to the adopter
          notificationsList.push({
            id: doc.id,
            image: petLister.profilePicture ? { uri: petLister.profilePicture } : null,
            name: petLister.name || "Pet Lister",
            content: (
              <Text>
                {petLister.name || "Pet Lister"} has rejected your adoption request for <Text style={styles.boldText}>{petRequest.petName}</Text>.
              </Text>
            ),
            time: moment().fromNow(), // Current time for Rejected status
            action: null, // No action needed for Rejected notifications
          });
        }
        
      });
      notificationsList.sort((a, b) => b.time.localeCompare(a.time));
      setNotifications(notificationsList);
    });

    return () => unsubscribe();
  }, [currentUser, users]);

  const fetchUserDetails = async (email) => {
    try {
      const usersQuery = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        return {
          name: userDoc.name,
          profilePicture: userDoc.profilePicture || null,
        };
      } else {
        console.log("User not found for email:", email);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details: ", error);
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {notifications.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.loadingText}>No notifications available</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id}>
              <TouchableOpacity
                style={styles.notifButton}
                onPress={notif.action}
                disabled={!notif.action}
              >
                {notif.image ? (
                  <Image style={styles.notifImage} source={notif.image} />
                ) : (
                  <View style={styles.iconContainer}>
                    <FontAwesome name="user-circle" size={70} color="#333" />
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
      </ScrollView>
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
    paddingBottom: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  notifButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  notifImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    marginLeft: 5,
    color: '#68C2FF',
  },
  horizontalLine: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "black",
    alignSelf: "stretch",
  },
  noNotificationsText: {
    fontFamily: "Lato",
    fontSize: 18,
    textAlign: "center",
    justifyContent: "center",
    marginTop: 20,
    color: "#888",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  boldText: {
    fontWeight: "bold",
    color: "#EF5B5B",
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#084C8F",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    fontFamily: "Lato",
    fontSize: 18,
    textAlign: "center",
    color: "#888",
  },
});


export default Notification;
