import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const Feed = () => {
  const params = useLocalSearchParams();

  useEffect(() => {
    // Log parameters for debugging
    console.log('Received parameters:', params);
  }, [params]);

  // Safely parse selectedImages
  let selectedImages = [];
  try {
    // Ensure the selectedImages parameter is a valid string and parse it
    if (params.selectedImages) {
      selectedImages = JSON.parse(params.selectedImages);
    }
  } catch (error) {
    console.error('Error parsing selectedImages:', error);
  }

  console.log('Parsed selectedImages:', selectedImages); // Debug log

  return (
    <View>
      <Text>Pet Name: {params.petName || 'N/A'}</Text>
      <Text>Pet Gender: {params.petGender || 'N/A'}</Text>
      <Text>Pet Age: {params.petAge || 'N/A'}</Text>
      <Text>Pet Weight: {params.petWeight || 'N/A'}</Text>
      <Text>Pet Personality: {params.petPersonality || 'N/A'}</Text>
      <Text>Pet Description: {params.petDescription || 'N/A'}</Text>
      <Text>Pet Illness History: {params.petIllnessHistory || 'N/A'}</Text>
      <Text>Pet Vaccinated: {params.petVaccinated || 'N/A'}</Text>
      <Text>Selected Images:</Text>

      {selectedImages.length > 0 ? (
        selectedImages.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={{ width: 100, height: 100, marginBottom: 10 }}
          />
        ))
      ) : (
        // Default image if no images are selected
        <Image
          source={require("../../assets/Profile/dp.png")}
          style={{ width: 100, height: 100, marginBottom: 10 }}
        />
      )}
    </View>
  );
};

export default Feed;
