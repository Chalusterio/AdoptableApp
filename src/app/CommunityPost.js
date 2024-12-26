import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SideBar from "../components/SideBar";
import { useNavigation } from '@react-navigation/native';
import { db } from "../../firebase";
import { auth } from "../../firebase";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";

const CommunityPost = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState("CommunityPost");
  const [postContent, setPostContent] = useState({
    title: "",
    who: "",
    what: "",
    when: "",
    where: "",
    why: "",
    urgent: false,
  });
  const [posts, setPosts] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoleAndPosts = async () => {
      if (auth.currentUser) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            Alert.alert("Error", "User role not found.");
          }

          const postsRef = collection(db, "Community_post");
          const querySnapshot = await getDocs(postsRef);
          const fetchedPosts = [];
          querySnapshot.forEach((doc) => {
            fetchedPosts.push({ id: doc.id, ...doc.data() });
          });

          setPosts(fetchedPosts);
        } catch (error) {
          console.error("Error fetching user role or posts:", error);
          Alert.alert("Error", "Could not fetch user role or posts.");
        }
      }
      setLoading(false);
    };

    fetchUserRoleAndPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (postContent.title.trim() === "" || postContent.what.trim() === "") {
      Alert.alert("Error", "Please fill out the title and description.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "Community_post"), postContent);
      console.log("Post written with ID: ", docRef.id);
      setPosts([postContent, ...posts]);
      setPostContent({
        title: "",
        who: "",
        what: "",
        when: "",
        where: "",
        why: "",
        urgent: false,
      });
      Alert.alert("Success", "Your post has been submitted!");
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const sortedPosts = posts.sort((a, b) => {
    if (a.urgent !== b.urgent) return b.urgent - a.urgent;
    if (a.when && b.when) return new Date(a.when) - new Date(b.when);
    return 0;
  });

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  const openPostDetails = (post) => {
    navigation.navigate("PostDetails", { post }); // Pass the post to the PostDetails screen
  };

  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <View style={styles.container}>
        {userRole === "organization" && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigateTo("PostEdit")}
          >
            <MaterialCommunityIcons name="pencil" size={30} color="white" />
          </TouchableOpacity>
        )}

        {userRole !== "organization" && (
          <Text style={[styles.messageText, { fontFamily: 'Lilita', textAlign: 'center' }]}>
            Curious about the latest community posts? Stay tuned for exciting updates!
          </Text>
        )}

        {userRole === "organization" && (
          <TouchableOpacity
            style={styles.rectangularButton}
            onPress={() => navigateTo("PostEdit")}
          >
            <Text style={styles.buttonText}>Share something with us...</Text>
          </TouchableOpacity>
        )}

        <ScrollView style={styles.postsContainer}>
          {sortedPosts.map((post, index) => (
            <TouchableOpacity key={index} onPress={() => openPostDetails(post)}>
              <View style={styles.post}>
                <View style={styles.postImageContainer}>
                  <MaterialCommunityIcons name="image" size={40} color="#ccc" />
                </View>
                <View style={styles.postDetails}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postSubtitle}>
                    {post.when ? `📅 ${post.when}` : "No date specified"}
                  </Text>
                  {post.urgent && <Text style={styles.urgentText}>🔥 Urgent</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SideBar>
  );
};

const styles = StyleSheet.create({
  // Add your existing styles here
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  profileButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#68C2FF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  rectangularButton: {
    backgroundColor: "#68C2FF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 100,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  messageText: {
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
    color: "#68C2FF",
  },
  postsContainer: {
    marginTop: 30,
  },
  post: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  postImageContainer: {
    marginRight: 20,
  },
  postDetails: {
    flex: 1,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postSubtitle: {
    fontSize: 14,
    color: "#777",
  },
  urgentText: {
    color: "red",
    fontWeight: "bold",
  },
});

export default CommunityPost;
