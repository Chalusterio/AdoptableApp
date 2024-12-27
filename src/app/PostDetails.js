import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import icons
import { useFonts } from "expo-font"; // For custom fonts

const PostDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params; // Get the post data from the route parameters

  const [fontsLoaded] = useFonts({
    "Lilita-One": require("../assets/fonts/LilitaOne-Regular.ttf"), // Adjust path as needed
  });

  if (!fontsLoaded) {
    return null; // Show nothing until the font is loaded
  }

  return (
    <View style={styles.outerContainer}>
      {/* Modal with full image background */}
      <View style={styles.modalWrapper}>
        <ImageBackground
          source={require("../assets/post/detailsbg.png")} // Set the background image
          style={styles.modalContainer}
          resizeMode="cover" // Ensures the image covers the entire modal container
        >
          <ScrollView contentContainerStyle={styles.content}>
            {/* Post Image */}
            {post.image ? (
              <Image
                source={{ uri: post.image }} // Ensure post.image contains a valid URL
                style={styles.postImage}
              />
            ) : null}

            {/* Post Title */}
            <Text style={styles.title}>{post.title}</Text>

            {/* Date */}
            <Text style={styles.subtitle}>
              {post.when ? `📅 ${post.when}` : "No date specified"}
            </Text>

            {/* Urgency */}
            {post.urgent && <Text style={styles.urgentText}>🔥 Urgent</Text>}

            {/* Posted By */}
            {post.postedBy && (
              <Text style={styles.postedByText}>Posted by: {post.postedBy}</Text>
            )}

            {/* Post Details */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Who:</Text>
              <Text style={styles.detailText}>{post.who}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>What:</Text>
              <Text style={styles.detailText}>{post.what}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Where:</Text>
              <Text style={styles.detailText}>{post.where}</Text>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>

      {/* Back Button with Left Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left-circle" size={30} color="#EF5B5B" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#68C2FF", // Set the outer background to #68C2FF
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
  modalWrapper: {
    width: "90%", // Modal width
    height: "80%", // Modal height
    justifyContent: "center", // Center modal content vertically
    alignItems: "center", // Center modal content horizontally
    borderRadius: 10, // Reduced border radius
    overflow: "hidden", // Ensure the content inside is clipped properly
  },
  modalContainer: {
    flex: 1,
    width: "100%", // Full width
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    borderRadius: 10, // Reduced border radius
    backgroundColor: "rgba(255, 255, 255, 10)", // White with slight opacity
    overflow: "hidden", // Ensure content is clipped inside the rounded corners
  },
  
  content: {
    paddingBottom: 20,
    marginTop:50,
  },
  postImage: {
    width: "100%",
    height: 200, // Adjust as needed
    borderRadius: 5, // Reduced border radius
    marginBottom: 20,
    resizeMode: "cover", // Ensure the image covers the area
  },
  title: {
    fontSize: 26,
    fontWeight: "bold", // Bold title
    color: "#333",
    marginBottom: 20,
    textAlign: "center", // Center the title
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  urgentText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  postedByText: {
    fontSize: 18,
    fontFamily: "Lilita-One", // Apply the custom font
    color: "#444",
    marginBottom: 15,
    textAlign: "center",
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
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
  },
});

export default PostDetails;
