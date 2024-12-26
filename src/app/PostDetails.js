import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const PostDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params; // Get the post data from the route parameters

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.subtitle}>
          {post.when ? `📅 ${post.when}` : "No date specified"}
        </Text>
        {post.urgent && <Text style={styles.urgentText}>🔥 Urgent</Text>}
        <Text style={styles.detailText}>Who: {post.who}</Text>
        <Text style={styles.detailText}>What: {post.what}</Text>
        <Text style={styles.detailText}>Where: {post.where}</Text>
        <Text style={styles.detailText}>Why: {post.why}</Text>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postBox: {
    backgroundColor: "#68C2FF", // Blue background for the post box
    borderRadius: 12,
    padding: 20,
    width: "90%", // Adjust the width to fit well on screen
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white", // White text for the title
    marginBottom: 10,
  },
  postSubtitle: {
    fontSize: 16,
    color: "white", // White text for the subtitle
    marginBottom: 5,
  },
  urgentText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  modalText: {
    fontSize: 16,
    color: "white", // White text for post details
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#fff", // White background for the close button
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#68C2FF", // Match button text color to the post box
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PostDetails;
