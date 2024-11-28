import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Foundation from "@expo/vector-icons/Foundation";

export default function Preferences() {
  const router = useRouter();

  // Use useLocalSearchParams to access local search params
  const { userName, userEmail, userContactNumber, livingSpace, ownedPets  } = useLocalSearchParams();

  const [petSize, setPetSize] = React.useState(9);
  const [personality, setPersonality] = React.useState(50);
  const [selectedPet, setSelectedPet] = React.useState(null);
  const [selectedGender, setSelectedGender] = React.useState(null);

  const handleFindPet = () => {
    if (selectedPet && selectedGender !== null) {
      router.push({
        pathname: "Main/Profile", 
        params: { userName, userEmail, userContactNumber, livingSpace, ownedPets }
      });
    } else {
      alert('Please complete all selections.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={styles.container}
      >
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
              style={[
                styles.optionButton,
                selectedPet === "cat" && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedPet("cat")}
            >
                <MaterialCommunityIcons
                  name="cat"
                  size={24}
                  color={selectedPet === "cat" ? "#68C2FF" : "#666"}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedPet === "cat" && styles.selectedOptionText,
                  ]}
                >
                  Cat
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedPet === "dog" && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedPet("dog")}
            >
                <MaterialCommunityIcons
                  name="dog"
                  size={24}
                  color={selectedPet === "dog" ? "#68C2FF" : "#666"}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedPet === "dog" && styles.selectedOptionText,
                  ]}
                >
                  Dog
                </Text>
            </TouchableOpacity>
          </View>

          {/* Gender Selection */}
          <Text style={styles.question}>Select Pet's gender</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedGender === "female" && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedGender("female")}
            >
                <Foundation
                  name="female-symbol"
                  size={24}
                  color={selectedGender === "female" ? "#68C2FF" : "#666"}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedGender === "female" && styles.selectedOptionText,
                  ]}
                >
                  Female
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedGender === "male" && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedGender("male")}
            >
                <Foundation
                  name="male-symbol"
                  size={24}
                  color={selectedGender === "male" ? "#68C2FF" : "#666"}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedGender === "male" && styles.selectedOptionText,
                  ]}
                >
                  Male
                </Text>
          </TouchableOpacity>
        </View>

        {/* Pet Size Slider */}
        <Text style={styles.question}>Which pet size do you prefer?</Text>
        <Slider
          style={styles.slider}
          minimumValue={9}
          maximumValue={23}
          step={1}
          value={petSize}
          onValueChange={setPetSize}
          minimumTrackTintColor="#68C2FF"
          maximumTrackTintColor="gray"
          thumbTintColor="#68C2FF"
        />
        <View style={styles.sliderLabelsContainer}>
          <Text style={styles.sliderLabel}>Small {'\n'}9 kg</Text>
          <View style={styles.sliderLabelLargeText}>
            <Text style={styles.sliderLabel}>Large</Text>
            <Text style={styles.sliderLabel}>23 kg above</Text>
          </View>
        </View>

        {/* Personality Slider */}
        <Text style={styles.question}>
          What type of personality do you prefer in a pet?
        </Text>
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
    marginBottom: 60,
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
    backgroundColor: '#FFFFFF', // Default background
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
    marginTop: 100,
  },
  findPetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
