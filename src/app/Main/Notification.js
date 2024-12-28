import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc, addDoc,
} from "firebase/firestore";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { db, auth } from "../../../firebase";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";

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

    // Initialize the notifications list
    let notificationsList = [];

    // First, handle pet requests
    const petRequestsQuery = query(
      collection(db, "pet_request"),
      where("status", "in", ["Pending", "Accepted", "Rejected", "Cancelled"])
    );

    const unsubscribe = onSnapshot(petRequestsQuery, async (querySnapshot) => {
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
        const notificationId = `${doc.id}-${petRequest.status}-${timestamp}`;

        let formattedTime = "";
        let timestamp = 0;
        if (petRequest.status === "Pending") {
          formattedTime = moment(
            petRequest.requestDate.seconds * 1000
          ).fromNow();
          timestamp = petRequest.requestDate.seconds * 1000;
        } else if (petRequest.status === "Accepted") {
          formattedTime = moment(
            petRequest.acceptDate.seconds * 1000
          ).fromNow();
          timestamp = petRequest.acceptDate.seconds * 1000;
        } else if (petRequest.status === "Rejected") {
          formattedTime = moment(
            petRequest.rejectDate.seconds * 1000
          ).fromNow();
          timestamp = petRequest.rejectDate.seconds * 1000;
        } else if (petRequest.status === "Cancelled") {
          formattedTime = moment(
            petRequest.cancelDate.seconds * 1000
          ).fromNow();
          timestamp = petRequest.cancelDate.seconds * 1000;
        }

        // Handle the Pending request notification
        if (
          petRequest.status === "Pending" &&
          currentUser.email === petRequest.listedBy
        ) {
          notificationsList.push({
            id: notificationId,
            image: adopter.profilePicture
              ? { uri: adopter.profilePicture }
              : null,
            name: adopter.name || "Adopter",
            content: (
              <Text>
                {adopter.name || "Adopter"} has requested to adopt your pet{" "}
                <Text style={styles.boldText}>{petRequest.petName}</Text>.
              </Text>
            ),
            time: formattedTime,
            timestamp,
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

        // Handle Accepted/Rejected notifications
        if (
          currentUser.email === petRequest.listedBy &&
          ["Accepted", "Rejected"].includes(petRequest.status)
        ) {
          const message =
            petRequest.status === "Accepted" ? (
              <Text>
                You have accepted {adopter.name || "the adopter"}'s request to
                adopt <Text style={styles.boldText}>{petRequest.petName}</Text>.
              </Text>
            ) : (
              <Text>
                You have rejected {adopter.name || "the adopter"}'s request to
                adopt <Text style={styles.boldText}>{petRequest.petName}</Text>.
              </Text>
            );

          notificationsList.push({
            id: notificationId,
            image: require("../../assets/Icon_white.png"),
            name: "System Notification",
            content: message,
            time: formattedTime,
            action: null,
            timestamp, // Ensure the timestamp is added for sorting
          });
        }

        // Handle Accepted notifications for Adopters
        if (
          petRequest.status === "Accepted" &&
          currentUser.email === petRequest.adopterEmail
        ) {
          notificationsList.push({
            id: notificationId,
            image: petLister.profilePicture
              ? { uri: petLister.profilePicture }
              : null,
            name: petLister.name || "Pet Lister",
            content: (
              <Text>
                {petLister.name || "Pet Lister"} has accepted your request to
                adopt <Text style={styles.boldText}>{petRequest.petName}.</Text>
                <Text style={styles.linkText}>
                  {"\n\n"}Click here for more details.
                </Text>
              </Text>
            ),
            time: formattedTime,
            timestamp,
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

        // Handle Rejected notifications for Adopters
        if (
          petRequest.status === "Rejected" &&
          currentUser.email === petRequest.adopterEmail
        ) {
          notificationsList.push({
            id: doc.id,
            image: petLister.profilePicture
              ? { uri: petLister.profilePicture }
              : null,
            name: petLister.name || "Pet Lister",
            content: (
              <Text>
                {petLister.name || "Pet Lister"} has rejected your adoption
                request for{" "}
                <Text style={styles.boldText}>{petRequest.petName}</Text>.
                {petRequest.rejectReason && (
                  <Text>
                    {"\n\nReason: "}
                    <Text style={styles.rejectText}>
                      {petRequest.rejectReason}
                    </Text>
                  </Text>
                )}
              </Text>
            ),
            time: formattedTime,
            timestamp,
            action: null,
          });
        }

        // Handle Cancelled notifications for Adopters
        if (
          petRequest.status === "Cancelled" &&
          currentUser.email === petRequest.adopterEmail
        ) {
          notificationsList.push({
            id: notificationId,
            image: require("../../assets/Icon_white.png"),
            name: "System Notification",
            content: (
              <Text>
                You cancelled adoption for{" "}
                <Text style={styles.boldText}>{petRequest.petName}</Text>.
              </Text>
            ),
            time: formattedTime,
            timestamp,
            action: null,
          });
        }

        // Handle Cancelled notifications for Listers
        if (
          petRequest.status === "Cancelled" &&
          currentUser.email === petRequest.listedBy
        ) {
          notificationsList.push({
            id: notificationId,
            image: adopter.profilePicture
              ? { uri: adopter.profilePicture }
              : null,
            name: adopter.name || "Adopter",
            content: (
              <Text>
                {adopter.name || "Adopter"} cancelled adoption for your pet{" "}
                <Text style={styles.boldText}>{petRequest.petName}</Text>.
              </Text>
            ),
            time: formattedTime,
            timestamp,
            action: null,
          });
        }
      });

      // After handling pet requests, fetch finalized adoptions
      const finalizedAdoptionsQuery = query(
        collection(db, "finalized_adoption"),
        where("petRequestDetails.adopterEmail", "==", currentUser.email) // Adopter notifications
      );

      const finalizedListerQuery = query(
        collection(db, "finalized_adoption"),
        where("petRequestDetails.listedBy", "==", currentUser.email) // Lister notifications
      );

      const fetchFinalizedAdoptions = async () => {
        const createNotification = (doc, isAdopter) => {
          const data = doc.data();
          const finalizedDate = new Date(data.dateFinalized); // Parse the ISO string into a Date object
          const formattedTime = moment(finalizedDate).fromNow(); // Use moment to format
          const timestamp = finalizedDate.getTime(); // Get UNIX timestamp

          const notificationId = isAdopter
            ? `${doc.id}-finalized-adopter`
            : `${doc.id}-finalized-lister`;

          // Check if the notification already exists
          if (notificationsList.some((notif) => notif.id === notificationId)) {
            return; // Skip duplicate notification
          }
          if (isAdopter) {
            notificationsList.push({
              id: `${doc.id}-finalized-adopter`,
              image: require("../../assets/Icon_white.png"),
              name: "System Notification",
              content: (
                <Text>
                  Congratulations, {data.petRequestDetails.name}! The adoption
                  of{" "}
                  <Text style={styles.boldText}>
                    {data.petRequestDetails.petName}
                  </Text>{" "}
                  has been finalized. Track their journey here.
                </Text>
              ),
              time: formattedTime,
              timestamp,
              action: () => router.push("/Main/Track"),
            });
          } else {
            notificationsList.push({
              id: `${doc.id}-finalized-lister`,
              image: require("../../assets/Icon_white.png"),
              name: "System Notification",
              content: (
                <Text>
                  {data.petRequestDetails.name || "Adopter"} has finalized the
                  adoption of{" "}
                  <Text style={styles.boldText}>
                    {data.petRequestDetails.petName || "their pet"}
                  </Text>
                  . Check the process here.
                </Text>
              ),
              time: formattedTime,
              timestamp,
              action: () => router.push("/Main/Track"),
            });
          }
        };

        try {
          const adopterSnapshot = await getDocs(finalizedAdoptionsQuery);
          const listerSnapshot = await getDocs(finalizedListerQuery);

          adopterSnapshot.forEach((doc) => createNotification(doc, true));
          listerSnapshot.forEach((doc) => createNotification(doc, false));

          // Sort combined notifications by time (latest first)
          notificationsList.sort((a, b) => b.timestamp - a.timestamp);
          setNotifications([...notificationsList]);
        } catch (error) {
          console.error("Error fetching finalized adoptions:", error);
        }
      };

      fetchFinalizedAdoptions();
    });

    return () => unsubscribe();
  }, [currentUser, users, router]);

  const fetchUserDetails = async (email) => {
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
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

  const deleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== id)
    );
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteNotification(id)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainNotificationContainer}>
          <Text style={styles.titleText}>Notifications</Text>
        </View>
        {notifications.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.loadingText}>No notifications available</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <Swipeable
              key={notif.id}
              renderRightActions={() => renderRightActions(notif.id)}
            >
              <View style={styles.horizontalLine}></View>
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
                <View style={styles.notificationContainer}>
                  <View style={styles.notifTextContainer}>
                    <Text style={styles.notifName}>{notif.name}</Text>
                    <Text style={styles.notifContent}>{notif.content}</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
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
  scrollViewContent: {
    paddingBottom: 0,
  },
  mainNotificationContainer: {
    padding: 20,
  },
  titleText: {
    fontFamily: "Lilita",
    fontSize: 25,
    color: "#68C2FF",
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
  notificationContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
    marginRight: 10,
  },
  timeContainer: {
    justifyContent: "flex-end", // Keeps the content at the end of the container
    alignItems: "flex-end", // Aligns the content (text) to the right
  },
  notifTime: {
    fontFamily: "Lato",
    fontSize: 12,
    color: "#68C2FF",
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
  rejectText: {
    color: "#777777",
    fontWeight: "bold",
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
    marginVertical: 250,
    fontFamily: "Lato",
    fontSize: 20,
    textAlign: "center",
    color: "#888",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF5B5B",
    width: 100,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Notification;