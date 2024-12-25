import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import SideBar from "../components/SideBar";
import { useRouter } from "expo-router";

const CommunityPost = () => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState("CommunityPost");

  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <View style={styles.container}>
        <Text style={styles.title}>This is the Community Post Drawer</Text>
        <Text style={styles.subtitle}>Freely navigate through the app!</Text>
      </View>
    </SideBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});

export default CommunityPost;
