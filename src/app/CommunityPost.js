import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Switch, ImageBackground } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SideBar from "../components/SideBar";
import { useNavigation } from '@react-navigation/native';
import { db } from "../../firebase";
import { auth } from "../../firebase";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { Calendar } from 'react-native-calendars';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false); // state for calendar visibility

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
      setModalVisible(false);  // Close modal after submission
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
    navigation.navigate("PostDetails", { post });
  };

  const handleDateSelect = (date) => {
    setPostContent({
      ...postContent,
      when: date.dateString,
    });
    setCalendarVisible(false); // Hide calendar after date selection
  };

  return (
    <ImageBackground source={require("../assets/post/postbg.png")} style={styles.backgroundImage}>
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
              onPress={() => setModalVisible(true)}  
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

          {/* Modal for creating a new post */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Create a Post</Text>

                <ScrollView style={styles.scrollView}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Title:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter title"
                      value={postContent.title}
                      onChangeText={(text) => setPostContent({ ...postContent, title: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Who:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Who can join or avail?"
                      value={postContent.who}
                      onChangeText={(text) => setPostContent({ ...postContent, who: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>What:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Describe what the post is about"
                      value={postContent.what}
                      onChangeText={(text) => setPostContent({ ...postContent, what: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>When:</Text>
                    <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.dateButton}>
                      <Text>{postContent.when ? postContent.when : "Select Date"}</Text>
                    </TouchableOpacity>
                  </View>

                  {calendarVisible && (
                    <View style={styles.calendarContainer}>
                      <Calendar
                        onDayPress={handleDateSelect}
                        markedDates={{ [postContent.when]: { selected: true, selectedColor: '#68C2FF' } }}
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Where:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Where is it happening?"
                      value={postContent.where}
                      onChangeText={(text) => setPostContent({ ...postContent, where: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Why:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Why is this post important?"
                      value={postContent.why}
                      onChangeText={(text) => setPostContent({ ...postContent, why: text })}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Urgent:</Text>
                    <Switch
                      value={postContent.urgent}
                      onValueChange={(value) => setPostContent({ ...postContent, urgent: value })}
                    />
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.postButton} onPress={handlePostSubmit}>
                      <Text style={styles.buttonText}>Post</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </SideBar>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // other styles...
  calendarContainer: {
    backgroundColor: "white",  
    borderRadius: 8,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, 
    padding: 10,
    marginTop: 10,
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  profileButton: {
    alignSelf: "flex-end",
  },
  postsContainer: {
    marginTop: 20,
  },
  post: {
    flexDirection: "row",
    marginVertical: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  postImageContainer: {
    marginRight: 10,
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
    color: "#888",
  },
  urgentText: {
    color: "red",
    fontSize: 12,
  },
  toggleCalendarButton: {
    backgroundColor: "#68C2FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
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
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%", // Adjust width
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollView: {
    maxHeight: 500,  // Adjust the max height of scrollable content
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
  dateButton: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "gray",
    paddingVertical: 15, // Increase vertical padding
    paddingHorizontal: 30, // Increase horizontal padding
    borderRadius: 5,
    minWidth: 130, // Ensure the button has a minimum width for a larger size
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
  },
  
  postButton: {
    backgroundColor: "#68C2FF",
    paddingVertical: 15, // Increase vertical padding
    paddingHorizontal: 30, // Increase horizontal padding
    borderRadius: 5,
    minWidth: 130, // Ensure the button has a minimum width for a larger size
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
  },
  
});

export default CommunityPost;
