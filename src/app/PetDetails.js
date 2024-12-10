import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db, auth } from "../../firebase"; // Ensure `auth` is imported from Firebase

const screenWidth = Dimensions.get("window").width;

const PetDetails = () => {
  const router = useRouter();
  const {
    petName,
    petType,
    petGender,
    petAge,
    petWeight,
    petPersonality,
    petDescription,
    petIllnessHistory,
    petVaccinated,
    images,
    username,
    profileImage,
    listedBy,
  } = useLocalSearchParams();
  const parsedImages = JSON.parse(images || "[]");

  const [isFavorited, setIsFavorited] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userName, setUserName] = useState(username);
  const [userProfileImage, setUserProfileImage] = useState(profileImage);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const scrollViewRef = useRef(null);
  const [imageURLs, setImageURLs] = useState([]);

  useEffect(() => {
    // Check if the user is logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true); // Set login status to true if the user is logged in
      } else {
        setIsLoggedIn(false); // Set login status to false if the user is not logged in
      }
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (listedBy && isLoggedIn) {
        // Only fetch user details if logged in
        try {
          const usersQuery = query(
            collection(db, "users"),
            where("email", "==", listedBy)
          );
          const querySnapshot = await getDocs(usersQuery);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setUserName(userDoc.name);
            if (userDoc.profilePicture) {
              setUserProfileImage(userDoc.profilePicture);
            } else {
              setUserProfileImage(null);
            }
          } else {
            console.log("User not found");
          }
        } catch (error) {
          console.error("Error fetching user details: ", error);
        }
      }
    };

    fetchUserName();
  }, [listedBy, isLoggedIn]); // Dependency on `isLoggedIn` ensures fetch happens only if logged in

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleAdopt = () => {
  console.log(`${petName} adopted!`);
  router.push({
    pathname: "/AdoptMe", // The route to navigate to
    params: { petName, username }, // Pass parameters if needed
  });
};


  const onScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const imageWidth = Dimensions.get("window").width;
    const index = Math.round(contentOffsetX / imageWidth);
    setCurrentIndex(index);
  };

  const fetchImageURLs = async (imagePaths) => {
    const storage = getStorage();
    try {
      const imageURLs = await Promise.all(
        imagePaths.map(async (imagePath) => {
          const imageRef = ref(storage, imagePath); // Correct path from Firestore
          const url = await getDownloadURL(imageRef);
          return url; // return the URL of the image
        })
      );
      setImageURLs(imageURLs); // Save URLs to state
    } catch (error) {
      console.error("Error fetching image URLs: ", error);
      setImageURLs([]); // In case of error, set an empty array
    }
  };

  useEffect(() => {
    if (parsedImages.length > 0) {
      fetchImageURLs(parsedImages);
    }
  }, [parsedImages]);

  // Conditional rendering based on login status
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginMessage}>
          You must be logged in to view this page.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Horizontal Image Scroll */}
        {imageURLs.length > 0 && (
          <View>
            <ScrollView
              horizontal={true}
              style={styles.imageScrollContainer}
              ref={scrollViewRef}
              onScroll={onScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
            >
              {imageURLs.map((imageURL, index) => (
                <View key={index} style={styles.petImageContainer}>
                  <Image source={{ uri: imageURL }} style={styles.petImage} />
                </View>
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {imageURLs.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Pet Details */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.mainInfoHeader}>
              <Text style={styles.petName}>{petName}</Text>
              <Text style={styles.petTypeIcon}>
                {petType === "Cat" ? (
                  <MaterialCommunityIcons name="cat" size={24} color="#333" />
                ) : (
                  <MaterialCommunityIcons name="dog" size={24} color="#333" />
                )}
              </Text>
              <Text
                style={[
                  styles.petGender,
                  { color: petGender === "Male" ? "#68C2FF" : "#EF5B5B" },
                ]}
              >
                {petGender === "Male" ? (
                  <Foundation name="male-symbol" size={24} color="#68C2FF" />
                ) : (
                  <Foundation name="female-symbol" size={24} color="#EF5B5B" />
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleFavorite}>
              <FontAwesome
                name={isFavorited ? "heart" : "heart-o"}
                size={24}
                color="#FF6B6B"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.subText}>{`${petAge} | ${petWeight}`}</Text>
          <Text style={styles.personalityText}>
            {petPersonality
              .split(",")
              .map((trait) => trait.trim())
              .join("     ●     ")}
          </Text>
          <Text style={styles.description}>{petDescription}</Text>
          <Text style={styles.sectionTitle}>Health History:</Text>
          <View>
            <Text style={styles.bulletText}>
              {petVaccinated === "Yes" ? "• Vaccinated" : "• Not Vaccinated"}
            </Text>
            {petIllnessHistory.split(",").map((illness, index) => (
              <Text key={index} style={styles.bulletText}>
                • {illness.trim()}
              </Text>
            ))}
          </View>
        </View>

        {/* "Posted By" */}
        <Text style={styles.postedByLabel}>Posted By:</Text>
        <View style={styles.postedByContainer}>
          {userProfileImage ? (
            <Image
              source={{ uri: userProfileImage }}
              style={styles.profileImage}
            />
          ) : (
            <FontAwesome name="user-circle" size={40} color="#fff" />
          )}
          <View style={styles.usernameContainer}>
            <Text style={styles.usernameText}>{userName}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Back and Adopt Buttons */}
      <View style={styles.buttonOuterContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.adoptButton} onPress={handleAdopt}>
            <Text style={styles.adoptButtonText}>Adopt Me</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#68C2FF",
  },
  scrollContainer: {
    flex: 1,
  },
  imageScrollContainer: {},
  petImageContainer: {
    flexDirection: "row", // Arrange images horizontally
  },
  petImage: {
    width: screenWidth, // Set each image to the width of the screen
    height: 500, // Maintain the height or adjust as needed
    resizeMode: "cover", // Ensure the image scales correctly
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    margin: 4,
  },
  activeDot: {
    backgroundColor: "#68C2FF", // Active dot color
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginTop: 30,
    margin: 20,
    padding: 30,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainInfoHeader: {
    flexDirection: "row", // Align children horizontally
    justifyContent: "space-between", // Distribute space evenly between items
    alignItems: "center", // Align items vertically in the center
  },
  petName: {
    fontSize: 24,
    fontFamily: "Lilita",
    color: "#333",
    marginRight: 10, // Add some right margin if necessary
  },
  petTypeIcon: {
    marginHorizontal: 10, // Add horizontal margin between petTypeIcon and other items
  },
  petGender: {
    fontSize: 24,
    marginLeft: 10, // Add left margin if necessary
  },
  subText: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#666",
    marginTop: 4,
  },
  personalityText: {
    fontSize: 16,
    fontFamily: "Lilita",
    color: "#68C2FF",
    textAlign: "center",
    marginVertical: 30,
  },
  description: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "LatoBold",
    color: "#333",
    marginTop: 30,
  },
  bulletText: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#000",
    marginVertical: 2,
  },
  postedByLabel: {
    fontSize: 16,
    fontFamily: "LatoBold",
    color: "white",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  postedByContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#68C2FF",
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "white",
    paddingVertical: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  usernameContainer: {
    flex: 1,
    justifyContent: "center",
  },
  usernameText: {
    fontSize: 20,
    fontFamily: "Lato",
    color: "#fff",
    marginVertical: 5,
    fontWeight: "bold",
    marginLeft: 10,
  },
  donateButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  buttonOuterContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "gray",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  adoptButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    marginLeft: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  adoptButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default PetDetails;


