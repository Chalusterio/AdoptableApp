import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Track = () => {
    return (
        <View style={styles.container}>
          <Text style={styles.text}>Track yo pet!</Text>
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      tabBarStyle: {
        backgroundColor: '#68C2FF', // Bottom bar background color
        borderTopWidth: 0, // Remove border for a cleaner look
      },
      text: {
        fontSize: 30,
      },
});

export default Track;
