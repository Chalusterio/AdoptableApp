import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const Notification = () => {
  const router = useRouter();

  // Example dynamic notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      image: require("../../assets/Notification/notifLogo.png"),
      name: "CDO Animal Welfare Society Inc",
      content: "Has approved your adoption request! Click Here to see the full payment information.",
      time: "1:25 PM",
      action: () => router.push("/ApproveAdoption"),
    },
    {
      id: 2,
      image: require("../../assets/Notification/notifLogo.png"),
      name: "CDO Animal Welfare Society Inc",
      content: "We are preparing Shiro for departure.",
      time: "9:55 PM",
      action: () => router.push("/Main/Track"),
    },
    {
      id: 3,
      image: require("../../assets/Profile/dp.png"),
      name: "Mary Jane",
      content: "A wild Mary Jane has requested to adopt your pet.",
      time: "6:40 PM",
      action: () => router.push("/Screening"), //Ezra, ilisda lang ning route kung makabuhat nakag file
    },
  ]);

  // Example: Fetch notifications (optional)
  useEffect(() => {
    // Simulate fetching notifications from an API
    // fetch('https://example.com/api/notifications')
    //   .then(response => response.json())
    //   .then(data => setNotifications(data));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {notifications.map((notif) => (
          <View key={notif.id}>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={notif.action}
              disabled={!notif.action} // Disable click if no action
            >
              <Image style={styles.notifImage} source={notif.image} />
              <View style={styles.notifTextContainer}>
                <Text style={styles.notifName}>{notif.name}</Text>
                <Text style={styles.notifContent}>{notif.content}</Text>
              </View>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </TouchableOpacity>

            {/* horizontal line */}
            <View style={styles.horizontalLine}></View>
          </View>
        ))}
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
    marginHorizontal: 10,
  },
  notifName: {
    fontFamily: "LatoBold",
    fontSize: 16,
  },
  notifContent: {
    fontFamily: "Lato",
    fontSize: 16,
  },
  notifTime: {
    fontFamily: "Lato",
    fontSize: 16,
  },
  horizontalLine: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "black",
    alignSelf: "stretch",
  },
});

export default Notification;
