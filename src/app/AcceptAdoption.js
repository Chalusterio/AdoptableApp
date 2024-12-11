import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function AcceptAdoption() {
  const route = useRoute();
  const { adopterEmail, petName = "Pet" } = route.params || {};
  const [adopterName, setAdopterName] = useState("Adopter");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdopterName() {
      const db = getFirestore();
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", adopterEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setAdopterName(userData.name || "Adopter");
        } else {
          console.warn("No user found with the provided email.");
        }
      } catch (error) {
        console.error("Error fetching adopter's name:", error);
      }
    }

    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
      await fetchAdopterName();
      setTimeout(async () => {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }, 3000);
    }

    prepare();
  }, [adopterEmail]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Finalizing details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.greetingsText}>
          You accepted {"\n"} {adopterName} as {petName}’s fur parent.
        </Text>
        <Text style={styles.instructionText}>
          {petName} is one step closer to a loving home. Get ready to finalize the adoption process!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#68C2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
  },
  greetingsText: {
    fontSize: 25,
    fontFamily: "Lilita",
    color: "white",
    marginTop: 15,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 18,
    fontFamily: "Lato",
    color: "white",
    margin: 20,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "white",
  },
});
