import React, { useState } from "react";
import { View, Image, StyleSheet, FlatList, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";

const ParallaxCarousel = ({ data, width, height }) => {
  const [activeIndex, setActiveIndex] = useState(0); // Track the active index
  const [selectedImages, setSelectedImages] = useState(data); // Track selected images
  const MAX_IMAGES = 5; // Limit for images

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / width); // Determine the index based on scroll position
    setActiveIndex(index);
  };

  const handleAddImage = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      return; // Do not allow adding images if the limit is reached
    }

    // Request permission to access the image library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    // Launch image picker and get the selected image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - selectedImages.length, // Limit selection based on current images
      quality: 1,
    });

    console.log('Image Picker Result:', result); // Log the result for debugging

    if (!result.canceled && result.assets) {
        // Log the image URIs to ensure they are selected
        console.log('Selected Images:', result.assets.map(image => image.uri));
        
      // Add the new images to the selected images
      setSelectedImages((prevImages) => [
        ...prevImages,
        ...result.assets.map((image) => ({ uri: image.uri })), // Keep the object format for rendering
      ]);
    } else {
      alert("No images selected.");
    }
  };

  const handleDeleteImage = (index) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((_, i) => i !== index)
    );
  };

  const renderItem = ({ item, index }) => {
    // Show the "Add Image" button only if the number of selected images is less than the max limit
    if (index === selectedImages.length && selectedImages.length < MAX_IMAGES) {
      return (
        <TouchableOpacity
          style={[styles.carouselItem, { width, height }]}
          onPress={handleAddImage}
        >
          <View style={styles.uploadContainer}>
          <MaterialIcons name="cloud-upload" size={50} color="#C2C2C2" />
          <Text style={styles.uploadText}>Maximum of 5 Pictures</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.carouselItem, { width, height }]}>
        <View style={styles.deleteContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteImage(index)}
          >
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Image source={{ uri: item.uri }} style={styles.carouselImage} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        pagingEnabled
        data={selectedImages} // Only show selected images, no extra upload item
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={handleScroll} // Track scroll position
        scrollEventThrottle={16} // For smoother scrolling
        ListFooterComponent={
          // Disable the "Add Image" button if max images are reached
          selectedImages.length >= MAX_IMAGES ? null : (
            <TouchableOpacity
              style={[styles.carouselItem, { width, height }]}
              onPress={handleAddImage}
            >
              <View style={styles.uploadContainer}>
                <MaterialIcons name="cloud-upload" size={50} color="#C2C2C2" />
                <Text style={styles.uploadText}>Tap to Add Image</Text>
              </View>
            </TouchableOpacity>
          )
        }
      />

      <View style={styles.pagination}>
        {selectedImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot, // Apply activeDot style to the current dot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  carouselItem: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "90%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EF5B5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 325,
    zIndex: 1,
    position: 'absolute',
    margin: 6,
  },
  uploadContainer: {
    width: "100%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0", // Light background to show it's an upload container
    borderRadius: 8,
  },
  uploadText: {
    textAlign: "center",
    fontFamily: "Lato",
    fontSize: 18,
    color: '#C2C2C2',
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "gray",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#000", // Active dot color
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default ParallaxCarousel;
