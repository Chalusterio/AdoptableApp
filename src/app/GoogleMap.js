import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const GoogleMap = ({ onRegionChange }) => {
  const [region, setRegion] = useState({
    latitude: 8.4333, // Cagayan de Oro City Latitude
    longitude: 124.6167, // Cagayan de Oro City Longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (onRegionChange) {
      onRegionChange(region); // Notify parent component about the region change
    }
  }, [region, onRegionChange]);

  const handleRegionChange = (newRegion) => {
    // Only update if the region has actually changed
    if (
      newRegion.latitude !== region.latitude ||
      newRegion.longitude !== region.longitude
    ) {
      setRegion(newRegion);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
      >
        <Marker coordinate={region} />
      </MapView>
      <Text style={styles.coordinates}>
        Latitude: {region.latitude.toFixed(4)} | Longitude: {region.longitude.toFixed(4)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 400,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  coordinates: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    padding: 5,
    borderRadius: 5,
  },
});

export default GoogleMap;
