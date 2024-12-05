import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router'; // To access passed params

const Track = () => {
  const {
    petName,
    petAge,
    petWeight,
    petImage,
    deliveryType,
    totalAmount,
  } = useLocalSearchParams(); // Retrieve params

  const currentStep = 2; // Current step (0-based index). Update dynamically based on the tracking status.

  const steps = [
    {
      title: 'Checking',
      description: "We're reviewing your request to ensure everything is good to go.",
      date: '15 October, 2024',
      time: '9:00 AM',
      icon: <FontAwesome5 name="check-circle" size={24} />,
    },
    {
      title: 'Preparing',
      description: 'Shiro is being prepared by the rescue organization for delivery.',
      date: '15 October, 2024',
      time: '10:50 AM',
      icon: <MaterialIcons name="build-circle" size={24} />,
    },
    {
      title: 'Transportation Arranged',
      description: 'A car is ready to deliver Shiro to your home.',
      date: '16 October, 2024',
      time: '11:20 AM',
      icon: <MaterialIcons name="local-shipping" size={24} />,
    },
    {
      title: 'Out for Delivery',
      description: 'Shiro is on his way to your home. Please be ready to welcome him!',
      date: '16 October, 2024',
      time: '3:00 PM',
      icon: <MaterialIcons name="directions-car" size={24} />,
    },
    {
      title: 'Delivered',
      description: 'Shiro has safely arrived at your home. Thank you for adopting!',
      date: '16 October, 2024',
      time: '4:30 PM',
      icon: <MaterialIcons name="home" size={24} />,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Track Your Pet</Text>

      {/* Pet Info Section */}
      <View style={styles.petInfoBox}>
        <Image
          source={{ uri: petImage }} // Use dynamic image URI
          style={styles.petImage}
        />
        <View>
          <Text style={styles.petName}>{petName}</Text>
          <Text style={styles.petDetails}>{petAge} | {petWeight}</Text>
        </View>
      </View>

      {/* Delivery Info Section */}
      <View style={styles.deliveryBox}>
        <Text style={styles.deliveryDetails}>Delivery Type: {deliveryType}</Text>
        <Text style={styles.deliveryDetails}>Amount: ₱ {totalAmount}</Text>
      </View>

      {/* Tracking Steps */}
      <View style={styles.trackingContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            {/* Line connecting steps */}
            {index > 0 && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: index <= currentStep ? '#68C2FF' : '#E0E0E0' },
                ]}
              />
            )}
            {/* Step Icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: index <= currentStep ? '#68C2FF' : '#FFFFFF' },
              ]}
            >
              {React.cloneElement(step.icon, {
                color: index <= currentStep ? '#FFFFFF' : '#68C2FF',
              })}
            </View>
            {/* Step Info */}
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
              <Text style={styles.stepDate}>
                {step.date} - {step.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Lilita',
    color: '#68C2FF',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'left',
  },
  petInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deliveryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  deliveryDetails: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  trackingContainer: {
    marginTop: 30,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 50,
    position: 'relative',
  },
  iconContainer: {
    marginTop: -2,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#68C2FF',
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    width: 2,
    height: 200,
    left: 20,
    top: -90,
    zIndex: 0,
  },
  stepInfo: {
    marginLeft: 15,
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  stepDate: {
    fontSize: 12,
    color: '#68C2FF',
    fontWeight: 'bold',
  },
});

export default Track;