import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Foundation from "@expo/vector-icons/Foundation";
import { getFirestore, collection, setDoc, doc, updateDoc } from 'firebase/firestore'; // Firestore imports

export default function Preferences() {
  const router = useRouter();

  // Use useLocalSearchParams to access local search params
  const { userName, userEmail, userContactNumber } = useLocalSearchParams();

  const [petSize, setPetSize] = React.useState(9);
  const [personality, setPersonality] = React.useState(50);
  const [selectedPet, setSelectedPet] = React.useState(null);
  const [selectedGender, setSelectedGender] = React.useState(null);

  const handleFindPet = async () => {
    if (selectedPet && selectedGender !== null) {
      // Save preferences to Firestore under 'preferences' collection
      const db = getFirestore();
      const preferencesRef = doc(db, 'preferences', userEmail); // Using email as document ID

      const preferenceData = {
        userEmail,
        selectedPet,
        selectedGender,
        petSize,
        petSizeLabel, // Store the label for pet size
        personality,
        personalityLabel, // Store the label for personality
      };

      try {
        // Set or update the user's preferences in Firestore
        await setDoc(preferencesRef, preferenceData, { merge: true });
        console.log('Preferences saved successfully!');
      } catch (error) {
        console.error('Error saving preferences:', error);
      }

      // Navigate to the main screen
      router.push({
        pathname: "Main",
        params: { userName, userEmail, userContactNumber }
      });
    } else {
      alert('Please complete all selections.');
    }
  };

  const getLabel = (value, labels) => {
    if (value <= 0.2) return labels[0];
    if (value <= 0.5) return labels[1];
    return labels[2];
  };

  const getPetSizeLabel = (value, selectedPet) => {
    if (selectedPet === 'cat') {
      if (value >= 1 && value <= 3) return 'Small (1-3 kg)';
      if (value > 3 && value <= 5) return 'Average (3-5 kg)';
      if (value > 5 && value <= 7) return 'Biggish (5-7 kg)';
      if (value > 7 && value <= 10) return 'Very Big (7-10 kg)';
      return 'Huge (10+ kg)';
    } else if (selectedPet === 'dog') {
      if (value >= 1 && value <= 5) return 'Tiny (1-5 kg)';
      if (value > 5 && value <= 10) return 'Small (5-10 kg)';
      if (value > 10 && value <= 15) return 'Average (10-15 kg)';
      if (value > 15 && value <= 25) return 'Large (15-25 kg)';
      if (value > 25 && value <= 39) return 'Extra Large (25-39 kg)';
      return 'Giant (40+ kg)';
    }
    return '';
  };

  const getPersonalityLabel = (value) => {
    if (value <= 25) return 'Calm';
    if (value <= 50) return 'Moderately Calm';
    if (value <= 75) return 'Moderately Playful';
    return 'Playful';
  };
  

const petSizeLabel = getPetSizeLabel(petSize, selectedPet);
const personalityLabel = getPersonalityLabel(personality);

  const getSliderLabels = () => {
    if (selectedPet === "cat") {
      return (
        <>
          <Text style={styles.sliderLabel}>Small {'\n'}1-3 kg</Text>
          <Text style={styles.sliderLabel}>Average {'\n'}3-5 kg</Text>
          <Text style={styles.sliderLabel}>Biggish {'\n'}5-7 kg</Text>
          <Text style={styles.sliderLabel}>Very Big {'\n'}7-10 kg</Text>
          <Text style={styles.sliderLabel}>Huge {'\n'}10+ kg</Text>
        </>
      );
    } else if (selectedPet === "dog") {
      return (
        <>
          <Text style={styles.sliderLabel}>Tiny {'\n'}1-5 kg</Text>
          <Text style={styles.sliderLabel}>Small {'\n'}5-10 kg</Text>
          <Text style={styles.sliderLabel}>Average {'\n'}10-15 kg</Text>
          <Text style={styles.sliderLabel}>Large {'\n'}15-25 kg</Text>
          <Text style={styles.sliderLabel}>Extra Large {'\n'}25-40 kg</Text>
          <Text style={styles.sliderLabel}>Giant {'\n'}40+ kg</Text>
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          {/* Back Button */}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.greetingText}>Nice to meet you {userName || "User"},</Text>
          <Text style={styles.titleText}>We'll help you find the right pet for you!</Text>

          {/* Pet Selection */}
          <Text style={styles.question}>Select Pet</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, selectedPet === "cat" && styles.selectedOptionButton]}
              onPress={() => setSelectedPet("cat")}
            >
              <MaterialCommunityIcons name="cat" size={24} color={selectedPet === "cat" ? "#68C2FF" : "#666"} />
              <Text style={[styles.optionText, selectedPet === "cat" && styles.selectedOptionText]}>Cat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, selectedPet === "dog" && styles.selectedOptionButton]}
              onPress={() => setSelectedPet("dog")}
            >
              <MaterialCommunityIcons name="dog" size={24} color={selectedPet === "dog" ? "#68C2FF" : "#666"} />
              <Text style={[styles.optionText, selectedPet === "dog" && styles.selectedOptionText]}>Dog</Text>
            </TouchableOpacity>
          </View>

          {/* Gender Selection */}
          <Text style={styles.question}>Select Pet's gender</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, selectedGender === "female" && styles.selectedOptionButton]}
              onPress={() => setSelectedGender("female")}
            >
              <Foundation name="female-symbol" size={24} color={selectedGender === "female" ? "#68C2FF" : "#666"} />
              <Text style={[styles.optionText, selectedGender === "female" && styles.selectedOptionText]}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, selectedGender === "male" && styles.selectedOptionButton]}
              onPress={() => setSelectedGender("male")}
            >
              <Foundation name="male-symbol" size={24} color={selectedGender === "male" ? "#68C2FF" : "#666"} />
              <Text style={[styles.optionText, selectedGender === "male" && styles.selectedOptionText]}>Male</Text>
            </TouchableOpacity>
          </View>

          {/* Pet Size Slider */}
          <Text style={styles.question}>Which pet size do you prefer?</Text>
          <Slider
            style={styles.slider}
            minimumValue={1} // Setting the minimum value to 1 kg for more flexibility
            maximumValue={selectedPet === "cat" ? 10 : 40} // Adjusted max value for cat to 20 kg
            step={1}
            value={petSize}
            onValueChange={setPetSize}
            minimumTrackTintColor="#68C2FF"
            maximumTrackTintColor="gray"
            thumbTintColor="#68C2FF"
          />

          <View style={styles.sliderLabelsContainer}>
            {getSliderLabels()}
          </View>

          {/* Personality Slider */}
          <Text style={styles.question}>What type of personality do you prefer in a pet?</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={personality}
            onValueChange={setPersonality}
            minimumTrackTintColor="#68C2FF"
            maximumTrackTintColor="gray"
            thumbTintColor="#68C2FF"
          />
          <View style={styles.sliderLabelsContainer}>
            <Text style={styles.sliderLabel}>Calm</Text>
            <Text style={styles.sliderLabel}>Playful</Text>
          </View>

          {/* Find Pet Button */}
          <TouchableOpacity style={styles.findPetButton} onPress={handleFindPet}>
            <Text style={styles.findPetButtonText}>Find My Pet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    padding: 20,
    flexDirection: 'column',
  },
  backButtonContainer: {
    backgroundColor: "gray",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
  },
  greetingText: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 10,
    fontFamily: 'Lato',
  },
  titleText: {
    fontSize: 24,
    color: '#68C2FF',
    marginBottom: 20,
    fontFamily: 'Lilita',
    marginBottom: 50,
  },
  question: {
    fontSize: 16,
    marginVertical: 15,
    color: 'black',
  },
  optionsContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingVertical: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },
  selectedOptionButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#68C2FF',
  },
  optionText: {
    color: 'gray',
    marginLeft: 10,
  },
  selectedOptionText: {
    color: '#68C2FF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sliderLabelLargeText: {
    alignItems: 'flex-end',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  findPetContainer: {
    width: "100%",
    alignItems: "center",
  },
  findPetButton: {
    backgroundColor: '#EF5B5B',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  findPetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});