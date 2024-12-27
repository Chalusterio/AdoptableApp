import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Button, SafeAreaView } from "react-native";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { useRouter } from "expo-router";
import { getDocs, collection, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useFonts } from "expo-font";
import { getSession } from "../../firebase";

const PostEdit = () => {
  const router = useRouter();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    setSelectedPost(null);
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
    <SafeAreaView style={styles.safeArea}>
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

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPost && (
              <>
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                <Text style={styles.modalText}>{selectedPost.what}</Text>
                <Text style={styles.modalText}>{selectedPost.moreDetails}</Text>
                <Button title="Close" onPress={closeModal} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    fontFamily: 'Lilita',
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
});

export default PostEdit;