import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import FastImage from "react-native-fast-image";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import FeedHeader from "../../components/FeedHeader";
import SideBar from "../../components/SideBar";
import { usePets } from "../../context/PetContext";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

const Feed = () => {
  const params = useLocalSearchParams();
  const { pets } = usePets();
  const router = useRouter();
  const { filteredPets, setFilteredPets } = usePets();
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState("Main");
  const [favoritedPets, setFavoritedPets] = useState({});
  const [userFavorites, setUserFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (currentMessage.trim()) {
      const userMessage = { sender: "user", text: currentMessage };
      setChatMessages((prev) => [...prev, userMessage]);
      setCurrentMessage("");
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
        const botResponse = {
          sender: "bot",
          text: "Thanks for your message!",
        };
        setChatMessages((prev) => [...prev, botResponse]);
      }, 1000);
    }
  };

  const selectedImages = params.selectedImages
    ? JSON.parse(params.selectedImages)
    : [];

  const isPetDataValid =
    params.petName &&
    params.petGender &&
    params.petAge &&
    params.petWeight &&
    params.petPersonality &&
    params.petDescription &&
    params.petIllnessHistory &&
    typeof params.petVaccinated !== "undefined" &&
    selectedImages.length > 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPreferencesAndRankPets(true);
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchUserFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = collection(db, "users");
          const userQuery = query(userRef, where("email", "==", user.email));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            setUserFavorites(userData.favorites || []);
            const userFavoritesIds =
              userData.favorites?.map((pet) => pet.id) || [];
            setFavoritedPets((prevState) => {
              const newState = { ...prevState };
              userFavoritesIds.forEach((id) => (newState[id] = true));
              return newState;
            });
          }
        } catch (error) {
          console.error("Error fetching user favorites:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserFavorites();
  }, []);

  const toggleFavorite = async (petId, petData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const userFavoritesRef = doc(db, "users", userId);
    setFavoritedPets((prevState) => {
      const newState = { ...prevState };
      if (newState[petId]) {
        delete newState[petId];
        setDoc(
          userFavoritesRef,
          { favorites: arrayRemove(petData) },
          { merge: true }
        );
      } else {
        newState[petId] = true;
        setDoc(
          userFavoritesRef,
          { favorites: arrayUnion(petData) },
          { merge: true }
        );
      }
      return newState;
    });
  };

  const fetchPreferencesAndRankPets = async (isRefresh = false) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const preferencesQuery = query(
        collection(db, "preferences"),
        where("userEmail", "==", user.email)
      );
      const preferencesSnapshot = await getDocs(preferencesQuery);

      let rankedPets = pets
        .filter((pet) => pet.status !== "finalized")
        .map((pet) => {
          let score = 0;

          if (preferencesSnapshot.empty) return { ...pet, score: 0 };
          const userPreferences = preferencesSnapshot.docs[0].data();

          if (
            pet.petPersonality &&
            pet.petPersonality.includes(userPreferences.personalityLabel)
          ) {
            score += 1;
          }

          const petWeight = parseInt(pet.petWeight, 10);
          let matchesSizeLabel = false;
          const sizeRangeMatch =
            userPreferences.petSizeLabel.match(/(\d+)-(\d+)/);
          if (sizeRangeMatch) {
            const minSize = parseInt(sizeRangeMatch[1], 10);
            const maxSize = parseInt(sizeRangeMatch[2], 10);
            matchesSizeLabel = petWeight >= minSize && petWeight <= maxSize;
            if (matchesSizeLabel) score += 1;
          }

          const matchesGender =
            userPreferences.selectedGender === "any" ||
            (pet.petGender &&
              pet.petGender.toLowerCase() ===
                userPreferences.selectedGender.toLowerCase());
          if (matchesGender) score += 1;

          const matchesPetType =
            userPreferences.selectedPet === "any" ||
            (pet.petType &&
              pet.petType.toLowerCase() ===
                userPreferences.selectedPet.toLowerCase());
          if (matchesPetType) score += 1;

          return { ...pet, score };
        });

      if (preferencesSnapshot.empty) {
        rankedPets = pets.map((pet) => ({ ...pet, score: 0 }));
      }

      rankedPets = rankedPets.sort((a, b) => b.score - a.score);
      const shuffledPets = isRefresh ? shuffleArray(rankedPets) : rankedPets;
      setFilteredPets(shuffledPets);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  useEffect(() => {
    fetchPreferencesAndRankPets();
  }, [pets]);

  const renderItem = ({ item }) => {
    const isFavorited = favoritedPets[item.id];
    const petAge = parseInt(item.petAge, 10);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          router.push({
            pathname: "/PetDetails",
            params: {
              ...item,
              images: JSON.stringify(item.images),
            },
          });
        }}
      >
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.favoriteIconButton}
            onPress={() => toggleFavorite(item.id, item)}
          >
            <FontAwesome
              name={isFavorited ? "heart" : "heart-o"}
              size={20}
              color={isFavorited ? "#FF6B6B" : "#FFFFFF"}
            />
          </TouchableOpacity>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
        </View>
        <View style={styles.petDetailsContainer}>
          <View style={styles.nameGenderContainer}>
            <Text style={styles.name}>{item.petName}</Text>
            <View style={styles.genderContainer}>
              {item.petGender === "Female" ? (
                <Foundation name="female-symbol" size={24} color="#EF5B5B" />
              ) : (
                <Foundation name="male-symbol" size={24} color="#68C2FF" />
              )}
            </View>
          </View>
          <Text style={styles.age}>
            {petAge} {petAge === 1 ? "year old" : "years old"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SideBar selectedItem={selectedItem} setSelectedItem={setSelectedItem}>
      <FeedHeader setFilteredPets={setFilteredPets} />
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#68C2FF" />
            <Text style={styles.loadingText}>Loading pets...</Text>
          </View>
        ) : filteredPets.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPets.filter((pet) => pet.status !== "finalized")}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            initialNumToRender={10}
            windowSize={21}
            removeClippedSubviews={true}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </SafeAreaView>

      {isChatVisible && (
  <View style={styles.chatContainer}>
    {/* Close Button */}
    <TouchableOpacity
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 999,
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 5,
      }}
      onPress={() => setIsChatVisible(false)}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>✕</Text>
    </TouchableOpacity>

    {/* Chat messages */}
    <FlatList
      ref={flatListRef}
      data={chatMessages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View
          style={[
            styles.messageBubble,
            item.sender === "user" ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.sender === "user" ? { color: "#fff" } : { color: "#333" },
            ]}
          >
            {item.text}
          </Text>
        </View>
      )}
      onContentSizeChange={() =>
        flatListRef.current?.scrollToEnd({ animated: true })
      }
      onLayout={() =>
        flatListRef.current?.scrollToEnd({ animated: true })
      }
    />

    {/* Typing indicator */}
    {isBotTyping && (
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    )}

    {/* 👇 Input bar fixed at the bottom */}
    <View style={styles.fixedInputBar}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={currentMessage}
          onChangeText={setCurrentMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}

      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => setIsChatVisible(true)}
      >
        <FontAwesome name="commenting" size={24} color="#fff" />
      </TouchableOpacity>
    </SideBar>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 999,
    backgroundColor: "#FAFAFA",
  },
  container: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    marginBottom: 20,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 230,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  favoriteIconButton: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    position: "absolute",
    right: 10,
    top: 10,
  },
  image: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  petDetailsContainer: {
    flex: 1,
    marginTop: 10,
    alignItems: "center",
  },
  nameGenderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: "LatoBold",
    color: "#333",
    marginRight: 8,
  },
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  age: {
    fontSize: 14,
    fontFamily: "Lato",
    color: "#888",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Lato",
    color: "#68C2FF",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: "#555",
    fontFamily: "Lato",
  },
  chatbotButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#4da6ff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 8,
    zIndex: 999,
  },
chatContainer: {
  position: "absolute",
  bottom: 100,
  right: 16,
  width: "90%",
  maxHeight: "70%",
  backgroundColor: "#D6EFFF",
  borderRadius: 20,
  paddingTop: 60,
  paddingBottom: 70,
  paddingHorizontal: 16,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
  elevation: 10,
  zIndex: 998,
},
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    marginHorizontal: 8,
    maxWidth: "85%",
  },
  userBubble: {
    backgroundColor: "#4da6ff",
    alignSelf: "flex-end",
    borderTopRightRadius: 2,
  },

  botBubble: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontFamily: "Lato",
    fontSize: 14,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#E9F4FF",
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  input: {
    flex: 1,
    height: 42,
    backgroundColor: "#fff",
    borderColor: "#B8DFFF",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: "Lato",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#2D9CDB", // Deeper blue for contrast
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 10,
    height: 24,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#888",
    marginHorizontal: 2,
  },
fixedInputBar: {
  position: "absolute",
  bottom: 10,
  left: 16,
  right: 16,
},
});

export default Feed;
