import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  Modal
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";

const SideBar = ({ children, selectedItem, setSelectedItem }) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const drawerWidth = screenWidth * 0.8; // Adjust the width of the drawer (80% of screen width)
  const drawerTranslateX = useState(new Animated.Value(-drawerWidth))[0]; // Start off-screen

  const toggleDrawer = () => {
    Animated.timing(drawerTranslateX, {
      toValue: drawerOpen ? -drawerWidth : 0, // Slide drawer to the left or to 0 position
      duration: 300,
      useNativeDriver: true, // Use native driver for better performance
    }).start();
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    Animated.timing(drawerTranslateX, {
      toValue: -drawerWidth, // Move drawer off-screen to the left
      duration: 300,
      useNativeDriver: true,
    }).start();
    setDrawerOpen(false);
  };

  const navigateTo = (screen) => {
    setSelectedItem(screen); // Update the selected item state
    router.push(screen); // Use expo-router's push method to navigate
    closeDrawer(); // Close the drawer after navigation
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Menu Icon */}
      {!drawerOpen && (
        <View style={styles.menuIcon}>
          <TouchableOpacity onPress={toggleDrawer}>
            <MaterialCommunityIcons name="menu" size={28} color="black" />
          </TouchableOpacity>
        </View>
      )}

      {/* Drawer as Modal */}
      <Modal visible={drawerOpen} transparent={true} animationType="none">
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.drawer, { width: drawerWidth, transform: [{ translateX: drawerTranslateX }] }]}
        >
          <View style={styles.blockPadContainer}></View>
          <View style={styles.logoImageContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logoImage} />
          </View>
          {/* Drawer items */}
          <TouchableOpacity
            onPress={() => navigateTo("Main")}
            style={[styles.drawerItem, selectedItem === "Main" && styles.activeDrawerItem]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Main" ? "paw" : "paw-outline"}
              size={24}
              color={selectedItem === "Main" ? "black" : "gray"}
            />
            <Text
              style={[styles.drawerItemText, selectedItem === "Main" && styles.activeDrawerItemText]}
            >
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Favorites")}
            style={[styles.drawerItem, selectedItem === "Favorites" && styles.activeDrawerItem]}
          >
            <FontAwesome
              name={selectedItem === "Favorites" ? "heart" : "heart-o"}
              size={24}
              color={selectedItem === "Favorites" ? "black" : "gray"}
            />
            <Text
              style={[styles.drawerItemText, selectedItem === "Favorites" && styles.activeDrawerItemText]}
            >
              Favorites
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Donate")}
            style={[styles.drawerItem, selectedItem === "Donate" && styles.activeDrawerItem]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Donate" ? "hand-coin" : "hand-coin-outline"}
              size={24}
              color={selectedItem === "Donate" ? "black" : "gray"}
            />
            <Text
              style={[styles.drawerItemText, selectedItem === "Donate" && styles.activeDrawerItemText]}
            >
              Donate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Uploads")}
            style={[styles.drawerItem, selectedItem === "Uploads" && styles.activeDrawerItem]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Uploads" ? "folder-upload" : "folder-upload-outline"}
              size={24}
              color={selectedItem === "Uploads" ? "black" : "gray"}
            />
            <Text
              style={[styles.drawerItemText, selectedItem === "Uploads" && styles.activeDrawerItemText]}
            >
              Uploads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Login")}
            style={[styles.drawerItem, selectedItem === "Login" && styles.activeDrawerItem]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Login" ? "logout" : "logout-variant"}
              size={24}
              color={selectedItem === "Login" ? "black" : "gray"}
            />
            <Text
              style={[styles.drawerItemText, selectedItem === "Login" && styles.activeDrawerItemText]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Main Content */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <View style={{ flex: 1 }}>{children}</View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  blockPadContainer: {
    width: "100%",
    height: 60,
    backgroundColor: "#68C2FF",
  },
  menuIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1000,
    borderRadius: 5,
    marginTop: 25,
    marginLeft: 10,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#fff",
    overflow: "hidden",
    zIndex: 999, // Ensure drawer is on top
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },
  logoImageContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  logoImage: {
    width: "80%",
    resizeMode: "contain",
  },
  drawerItem: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white", // Default background
  },
  drawerItemText: {
    fontSize: 16,
    color: "gray", // Default text color
    fontFamily: "Lato",
    marginLeft: 30,
  },
  activeDrawerItem: {
    backgroundColor: "rgba(104, 194, 255, 0.5)", // Active background color with 50% opacity
  },
  activeDrawerItemText: {
    color: "black", // Active text color
  },
});

export default SideBar;
