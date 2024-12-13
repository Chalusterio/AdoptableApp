import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useNotifications } from "../../context/NotificationContext"; // Adjust the path as needed

const Notification = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications(); // Use context to get notifications
  const router = useRouter();

  // If there are no notifications, show loading text or a message.
  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.centeredContainer}>
            <Text style={styles.loadingText}>No notifications available</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {notifications.map((notif) => (
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

            <View style={styles.horizontalLine}></View>
          </View>
        ))}
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
    justifyContent: "flex-end",
    alignItems: "flex-end",
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
    alignItems: "center",
    color: "#888",
  },
});

export default Notification;
