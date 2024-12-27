import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Image, ScrollView, TextInput, Button } from "react-native";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { useRouter } from "expo-router";
import { getDocs, collection, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useFonts } from "expo-font";
import { getSession } from "../../firebase";

const PostEdit = () => {
  const router = useRouter();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Track if the modal is in edit mode

  const [fontsLoaded] = useFonts({
    LilitaOne: require("../assets/fonts/LilitaOne-Regular.ttf"),
  });

  useEffect(() => {
    const fetchUserSession = async () => {
      const session = await getSession();
      if (session) {
        setCurrentUser(session);
      }
    };
    fetchUserSession();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const userEmail = currentUser.email;
          const postsRef = collection(db, "Community_post");
          const q = query(postsRef, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);

          const fetchedPosts = [];
          querySnapshot.forEach((doc) => {
            fetchedPosts.push({ id: doc.id, ...doc.data() });
          });

          setUserPosts(fetchedPosts);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    if (currentUser) {
      fetchUserPosts();
    }
  }, [currentUser]);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading fonts...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#68C2FF" />
        <Text style={styles.title}>Loading your posts...</Text>
      </View>
    );
  }

  const openModal = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false); // Reset edit mode
    setSelectedPost(null);
  };

  const handleDelete = async () => {
    if (selectedPost) {
      try {
        // Delete the document from Firestore
        await deleteDoc(doc(db, "Community_post", selectedPost.id));

        // Remove the deleted post from the local state
        setUserPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== selectedPost.id)
        );

        console.log("Post deleted successfully");
        closeModal(); // Close the modal after deletion
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleSave = async () => {
    if (selectedPost) {
      try {
        const postRef = doc(db, "Community_post", selectedPost.id);
        await updateDoc(postRef, {
          title: selectedPost.title,
          what: selectedPost.what,
          where: selectedPost.where,
          who: selectedPost.who,
          when: selectedPost.when,
          urgent: selectedPost.urgent,
        });
        console.log("Post updated successfully");
        closeModal(); // Close the modal after saving
      } catch (error) {
        console.error("Error updating post:", error);
      }
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.what}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <MaterialCommunityIcons
        name="arrow-left-circle"
        size={30}
        color="#EF5B5B"
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
          renderItem={renderItem}
          numColumns={1}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedPost && (
        <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.scrollView}>
                {selectedPost.image && (
                  <Image source={{ uri: selectedPost.image }} style={styles.modalImage} />
                )}

                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedPost.when ? `📅 ${selectedPost.when}` : "No date specified"}
                </Text>

                {selectedPost.urgent && <Text style={styles.modalUrgentText}>🔥 Urgent</Text>}
                {selectedPost.postedBy && (
                  <Text style={styles.modalText}>Posted by: {selectedPost.postedBy}</Text>
                )}

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={selectedPost.title}
                      onChangeText={(text) => setSelectedPost({ ...selectedPost, title: text })}
                      placeholder="Title"
                    />
                    <TextInput
                      style={styles.input}
                      value={selectedPost.what}
                      onChangeText={(text) => setSelectedPost({ ...selectedPost, what: text })}
                      placeholder="What"
                    />
                    <TextInput
                      style={styles.input}
                      value={selectedPost.where}
                      onChangeText={(text) => setSelectedPost({ ...selectedPost, where: text })}
                      placeholder="Where"
                    />
                    <TextInput
                      style={styles.input}
                      value={selectedPost.who}
                      onChangeText={(text) => setSelectedPost({ ...selectedPost, who: text })}
                      placeholder="Who"
                    />
                    <TextInput
                      style={styles.input}
                      value={selectedPost.when}
                      onChangeText={(text) => setSelectedPost({ ...selectedPost, when: text })}
                      placeholder="When"
                    />
                  </>
                ) : (
                  <>
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoTitle}>Who:</Text>
                      <Text style={styles.detailText}>{selectedPost.who}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Text style={styles.infoTitle}>What:</Text>
                      <Text style={styles.detailText}>{selectedPost.what}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Text style={styles.infoTitle}>Where:</Text>
                      <Text style={styles.detailText}>{selectedPost.where}</Text>
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.actionsContainer}>
                {isEditing ? (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#68C2FF" }]}
                    onPress={handleSave}
                  >
                    <Text style={styles.actionText}>Save</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#EF5B5B" }]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#68C2FF" }]}
                  onPress={handleEdit}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <MaterialCommunityIcons
                  name="arrow-left-circle"
                  size={30}
                  color="#EF5B5B"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Existing styles here

  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 32,
    fontFamily: "LilitaOne",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 1,
  },
  listContainer: {
    padding: 16,
    marginTop: 50,
  },
  card: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    padding: 12,
  },
  cardContent: {
    paddingHorizontal: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#68C2FF", // Blue background
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white", // White modal
    borderRadius: 20, // Border radius
    marginHorizontal: 50, // 50 margin on both sides
    alignItems: "center",
  },
  scrollView: {
    marginBottom: 20,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 20,
    resizeMode: "cover",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "LilitaOne",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  modalUrgentText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold", // Bold titles
    color: "#333",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 20, // Add padding to create space
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
    marginHorizontal: 5, // Add margin between buttons
  },
  
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
  },
});

export default PostEdit;
