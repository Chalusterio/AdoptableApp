import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import SideBar from "../components/SideBar";
import { useRouter } from "expo-router";
import { getDocs, collection, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase"; // Import Firestore and Auth
import { TextInput } from "react-native-paper"; // Optional: Add TextInput for searching or filtering posts

const PostEdit = () => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState("PostEdit");
  const [userPosts, setUserPosts] = useState([]); // Store posts created by the user
  const [loading, setLoading] = useState(true); // Loading state to show a loading indicator while fetching data

  // Fetch user posts when the component mounts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (auth.currentUser) {
        try {
          const userId = auth.currentUser.uid; // Get current user's ID

          // Query Firestore for posts where the userId field matches the current user's ID
          const postsRef = collection(db, "Community_post");
          const q = query(postsRef, where("userId", "==", userId)); // Only fetch posts by the current user

          const querySnapshot = await getDocs(q);
          const fetchedPosts = [];

          querySnapshot.forEach((doc) => {
            fetchedPosts.push({ id: doc.id, ...doc.data() }); // Push post data into the array
          });

          setUserPosts(fetchedPosts); // Update state with fetched posts
        } catch (error) {
          console.error("Error fetching posts:", error);
          Alert.alert("Error", "Could not fetch your posts.");
        } finally {
          setLoading(false); // Stop loading once data is fetched
        }
      }
    };

    fetchUserPosts(); // Call the fetch function when the component mounts
  }, []);

  // Render loading indicator while fetching data
  if (loading) {
    return (
      <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
        <View style={styles.container}>
          <Text style={styles.title}>Loading your posts...</Text>
        </View>
      </SideBar>
    );
  }

  // Render the list of user posts
  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Posts</Text>
        {userPosts.length === 0 ? (
          <Text style={styles.subtitle}>You have no posts yet.</Text>
        ) : (
          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.postContainer}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postContent}>{item.what}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SideBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
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
  postContainer: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginVertical: 8,
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  postContent: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default PostEdit;
