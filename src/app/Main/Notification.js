import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { collection, query, getDocs, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notification = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [adopters, setAdopters] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const petRequestsQuery = query(
      collection(db, "pet_request"),
      where("status", "==", "Pending"),
      where("listedBy", "==", currentUser.email)
    );

    const unsubscribe = onSnapshot(petRequestsQuery, async (querySnapshot) => {
      const savedMapping = await loadAdjectiveMapping();
      const notificationsList = [];

      querySnapshot.forEach((doc) => {
        const petRequest = doc.data();

        if (!adopters[petRequest.adopterEmail]) {
          fetchAdopterDetails(petRequest.adopterEmail).then((adopterDetails) => {
            if (adopterDetails) {
              setAdopters((prev) => ({
                ...prev,
                [petRequest.adopterEmail]: adopterDetails,
              }));
            }
          });
        }

        const adopter = adopters[petRequest.adopterEmail] || {};
        const formattedTime = moment(petRequest.requestDate.seconds * 1000).fromNow();

        if (adopter.name && petRequest.petName) {
          notificationsList.push({
            id: doc.id,
            image: adopter.profilePicture ? { uri: adopter.profilePicture } : null,
            name: adopter.name || "Adopter",
            content: (
              <Text>
                A {getRandomAdjective()} <Text style={styles.boldText}>{adopter.name || "Adopter"}</Text> has requested to adopt <Text style={styles.boldText}>{petRequest.petName}</Text>.
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
      });

      setNotifications(notificationsList);
    });

    return () => unsubscribe();
  }, [currentUser, adopters]);

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
    "lively", "radiant", "gracious","charming"];

  const getRandomAdjective = () => {
    const consonantAdjectives = adjectives.filter(adj => !/^[aeiou]/i.test(adj));
    const randomIndex = Math.floor(Math.random() * consonantAdjectives.length);
    return consonantAdjectives[randomIndex];
  };

  const saveAdjectiveMapping = async (mapping) => {
    try {
      await AsyncStorage.setItem("adjectiveMapping", JSON.stringify(mapping));
    } catch (error) {
      console.error("Error saving adjective mapping: ", error);
    }
  };

  const loadAdjectiveMapping = async () => {
    try {
      const mapping = await AsyncStorage.getItem("adjectiveMapping");
      return mapping ? JSON.parse(mapping) : {};
    } catch (error) {
      console.error("Error loading adjective mapping: ", error);
      return {};
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        {notifications.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
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
  scrollViewContent: {
    paddingBottom: 0,
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
