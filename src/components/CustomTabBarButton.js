import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const CustomTabBarButton = ({ onPress, isFocused, label, icon }) => {
  const [fontsLoaded] = useFonts({
    Lilita: require('./../assets/fonts/LilitaOne-Regular.ttf'),
    Lato: require('./../assets/fonts/Lato-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.buttonContainer, isFocused && styles.focusedContainer]}
    >
      <View style={[styles.iconWrapper, isFocused && styles.focusedIconWrapper]}>
        <MaterialCommunityIcons
          name={icon}
          size={30} // Icon size
          color={isFocused ? '#68C2FF' : '#FFFFFF'}
        />
      </View>
      {isFocused && label && (
        <Text style={[styles.focusedLabel, !label && styles.noMargin]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,  // Fixed height for the button container
    flex: 1, // Ensures it fills the available space within the tab bar
  },
  focusedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    padding: 22,
    elevation: 4,
    height: 90, // Fixed height for focused button
  
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedLabel: {
    marginLeft: 3,
    fontSize: 13, // Increased font size for better readability
    fontFamily: 'Lilita',
    color: '#68C2FF',
  },
  noMargin: {
    marginLeft: 0,
  },
});

export default CustomTabBarButton;