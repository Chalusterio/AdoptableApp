import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Screening({ route }) {
  const router = useRouter();

  const handleAcceptAdoption = () => {
    router.push("AcceptAdoption");
  };

  const handleRejectAdoption = () => {
    router.push("RejectAdoption");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Back Button */}
          <View style={styles.buttonImageContainer}>
            <View style={styles.backButtonContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Image
              source={require("../assets/Notification/adopterImage.png")}
              style={styles.adopterImage}
            />

            <Text style={styles.adopterName}>Mary Jane</Text>

            <Text style={styles.profileStatus}>Active • Devoted Pet Owner</Text>

            <View style={styles.detailsContainer}>
              <Icon
                name="email"
                size={24}
                color="#444444"
                style={styles.icon}
              />
              <Text style={styles.detailsText}>maryjane@gmail.com</Text>
            </View>

            {/* Horizontal Line */}
            <View style={styles.horizontalLine}></View>

            <View style={styles.detailsContainer}>
              <Icon
                name="phone"
                size={24}
                color="#444444"
                style={styles.icon}
              />
              <Text style={styles.detailsText}>0984 174 2482</Text>
            </View>

            {/* Horizontal Line */}
            <View style={styles.horizontalLine}></View>

            <View style={styles.detailsContainer}>
              <Icon
                name="location-on"
                size={24}
                color="#444444"
                style={styles.icon}
              />
              <Text style={styles.detailsText}>
                123 ABC Street, Barangay Carmen, Cagayan de Oro City, Misamis
                Oriental, 9000, Philippines
              </Text>
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
              <Text style={styles.detailsText}>Has a pet</Text>
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

              {/* Accept Button */}
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
