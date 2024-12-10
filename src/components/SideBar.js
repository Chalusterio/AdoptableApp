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
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";

const SideBar = ({ children, selectedItem, setSelectedItem }) => {
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerWidth = useState(new Animated.Value(0))[0];
    const screenWidth = Dimensions.get("window").width;
  
    const toggleDrawer = () => {
      Animated.timing(drawerWidth, {
        toValue: drawerOpen ? 0 : screenWidth * 0.7,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setDrawerOpen(!drawerOpen);
    };
  
    const closeDrawer = () => {
      Animated.timing(drawerWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
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
  
        {/* Drawer */}
        <Animated.View style={[styles.drawer, { width: drawerWidth }]}>
            <View style={styles.blockPadContainer}></View>
          <View style={styles.logoImageContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logoImage} />
          </View>
          {/* Drawer items */}
          <TouchableOpacity
            onPress={() => navigateTo("Main")}
            style={[
              styles.drawerItem,
              selectedItem === "Main" && styles.activeDrawerItem,
            ]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Main" ? "paw" : "paw-outline"}
              size={24}
              color={selectedItem === "Main" ? "black" : "gray"}
            />
            <Text
              style={[
                styles.drawerItemText,
                selectedItem === "Main" && styles.activeDrawerItemText,
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Favorites")}
            style={[
              styles.drawerItem,
              selectedItem === "Favorites" && styles.activeDrawerItem,
            ]}
          >
            <FontAwesome
              name={selectedItem === "Favorites" ? "heart" : "heart-o"}
              size={24}
              color={selectedItem === "Favorites" ? "black" : "gray"}
            />
            <Text
              style={[
                styles.drawerItemText,
                selectedItem === "Favorites" && styles.activeDrawerItemText,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Donate")}
            style={[
              styles.drawerItem,
              selectedItem === "Donate" && styles.activeDrawerItem,
            ]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Donate" ? "hand-coin" : "hand-coin-outline"}
              size={24}
              color={selectedItem === "Donate" ? "black" : "gray"}
            />
            <Text
              style={[
                styles.drawerItemText,
                selectedItem === "Donate" && styles.activeDrawerItemText,
              ]}
            >
              Donate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Uploads")}
            style={[
              styles.drawerItem,
              selectedItem === "Uploads" && styles.activeDrawerItem,
            ]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Uploads" ? "folder-upload" : "folder-upload-outline"}
              size={24}
              color={selectedItem === "Uploads" ? "black" : "gray"}
            />
            <Text
              style={[
                styles.drawerItemText,
                selectedItem === "Uploads" && styles.activeDrawerItemText,
              ]}
            >
              Uploads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("Login")}
            style={[
              styles.drawerItem,
              selectedItem === "Login" && styles.activeDrawerItem,
            ]}
          >
            <MaterialCommunityIcons
              name={selectedItem === "Login" ? "logout" : "logout-variant"}
              size={24}
              color={selectedItem === "Login" ? "black" : "gray"}
            />
            <Text
              style={[
                styles.drawerItemText,
                selectedItem === "Login" && styles.activeDrawerItemText,
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </Animated.View>
  
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
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%", // Full height of the screen
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 999, // Ensure drawer is on top
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
