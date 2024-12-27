import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { useRouter } from "expo-router";
import { getDocs, collection, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase"; // Import Firestore and Auth
import { MaterialCommunityIcons } from "react-native-vector-icons"; // Import MaterialCommunityIcons for the back arrow
import { useFonts } from "expo-font"; // Import expo-font to load the custom font

const PostEdit = () => {
  const router = useRouter();
  const [userPosts, setUserPosts] = useState([]); // Store posts created by the user
  const [loading, setLoading] = useState(true); // Loading state to show a loading indicator while fetching data
  const [currentUser, setCurrentUser] = useState(null); // Track the current user

  // Load LilitaOne font
  const [fontsLoaded] = useFonts({
    LilitaOne: require("../assets/fonts/LilitaOne-Regular.ttf"), // Ensure the font file is in the correct path
  });

  // Fetch the current user when the component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user); // Set current user when authenticated
      } else {
        setCurrentUser(null); // Handle when no user is logged in
      }
    });

    return unsubscribe; // Unsubscribe on component unmount
  }, []);

  // Fetch user posts when the component mounts and the current user is available
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (currentUser) {
        try {
          const userEmail = currentUser.email; // Get current user's email

          // Query Firestore for posts where the userEmail field matches the current user's email
          const postsRef = collection(db, "Community_post");
          const q = query(postsRef, where("userEmail", "==", userEmail)); // Fetch posts by email

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

    if (currentUser) {
      fetchUserPosts(); // Fetch posts if currentUser is available
    }
  }, [currentUser]); // Dependency on currentUser to re-fetch when user state changes

  // Render loading indicator while fetching data
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading fonts...</Text> {/* Show loading text while the font is being loaded */}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading your posts...</Text>
      </View>
    );
  }

  // Render the list of user posts
  return (
    <View style={styles.container}>
      {/* Custom back button with MaterialCommunityIcons */}
      <MaterialCommunityIcons
        name="arrow-left-circle"
        size={30}
        color="#EF5B5B" // You can change this to white (#fff) or any other color
        style={styles.backButton}
        onPress={() => router.back()}
      />

      <Text style={[styles.title, { fontFamily: "LilitaOne", textAlign: "center" }]}>
        Your Posts
      </Text>

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
  backButton: {
    position: "absolute",
    top: 40, // Adjust based on your header height
    left: 10, // Adjust the distance from the left edge
    zIndex: 1, // Ensure it stays on top of other elements
  },
});

export default PostEdit;
