import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { auth, signOut } from "../../firebase"; // Ensure you have this function in your firebase.js
import { useRouter } from "expo-router";

export default function TestPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      console.log("User logged out");
      router.push("/Login"); // Ensure the route is correct (if you use a different path for login, change this)
    } catch (error) {
      console.error("Error logging out: ", error.message);
    } finally {
      setLogoutConfirmVisible(false); // Close logout confirmation modal
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Manage Track</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#EF5B5B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
