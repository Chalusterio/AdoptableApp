import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Bruno from '../../../assets/Track/bruno.jpg';
import Shiro from '../../../assets/Track/shiro.jpg';

const PetCard = ({ pet, onToggle, isExpanded }) => {
  const currentStep = 1; // Current step for tracking (mock data)
  const bigSteps = [
    { title: 'Preparing', icon: <MaterialIcons name="build-circle" size={24} /> },
    { title: 'Transporting', icon: <MaterialIcons name="local-shipping" size={24} /> },
    { title: 'Out for Delivery', icon: <MaterialIcons name="directions-car" size={24} /> },
    { title: 'Delivered', icon: <MaterialIcons name="home" size={24} /> },
  ];

  const smallSteps = {
    Preparing: ['Adoption Request being reviewed', 'Preparing for delivery'],
    Transporting: ['Car ready for delivery', 'Your pet has arrived in a resting stop'],
    'Out for Delivery': [],
    Delivered: [],
  };

  return (
    <View style={styles.petCard}>
      {/* Pet and Delivery Info */}
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.petInfoBox}>
          <View>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petDetails}>{pet.age} | {pet.weight}</Text>
          </View>
          <Image source={pet.image} style={styles.petImage} />
        </View>
      </TouchableOpacity>
      <View style={styles.deliveryBox}>
        <View style={styles.deliveryDetailBox}>
          <Text style={styles.deliveryDetails}>Delivery Type: {pet.deliveryType}</Text>
        </View>
        <View style={styles.deliveryDetailBox}>
          <Text style={styles.deliveryDetails}>Amount: ₱ {pet.totalAmount}</Text>
        </View>
      </View>

      {/* Tracking Steps (Expandable Section) */}
      {isExpanded && (
        <View style={styles.trackingContainer}>
          {bigSteps.map((step, index) => (
            <View key={index} style={styles.bigStepContainer}>
              {/* Big Step Row */}
              <View style={styles.bigStepRow}>
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
                <Text style={styles.bigStepTitle}>{step.title}</Text>
              </View>

              {/* Small Steps */}
              {index <= currentStep && smallSteps[step.title]?.length > 0 && (
                <View style={styles.smallStepsContainer}>
                  {smallSteps[step.title].map((smallStep, i) => (
                    <View key={i} style={styles.smallStep}>
                      <View style={styles.smallStepDot} />
                      <Text style={styles.smallStepText}>{smallStep}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
          {/* Cancel Adoption Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={() => alert('Adoption canceled')}>
            <Text style={styles.cancelButtonText}>Cancel Adoption</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const Track = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const pets = [
    {
      id: 1,
      name: 'Shiro',
      age: '2 years',
      weight: '5 kg',
      image: Shiro,
      deliveryType: 'Car',
      totalAmount: '500',
    },
    {
      id: 2,
      name: 'Bruno',
      age: '1 year',
      weight: '3 kg',
      image: Bruno,
      deliveryType: 'Car',
      totalAmount: '0',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Track Your Pets</Text>
      {pets.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          isExpanded={expandedCard === pet.id}
          onToggle={() =>
            setExpandedCard((prev) => (prev === pet.id ? null : pet.id))
          }
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: '#EF5B5B',
    borderRadius: 20,
    paddingVertical: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
},
cancelButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},
  header: {
    fontSize: 24,
    fontFamily: 'Lilita',
    color: '#68C2FF',
    marginTop: 30,
    marginBottom: 20,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  petInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  petImage: {
    width: 75,
    height: 75,
    borderRadius: 50,
    marginRight: 15,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  petDetails: {
    fontSize: 16,
    color: '#666',
  },
  deliveryBox: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  deliveryDetailBox: {
    borderWidth: 2,
    borderColor: '#68C2FF',
    borderRadius: 20, // Makes the border rounded
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginHorizontal: 10, // Adds space between the boxes
  },
  deliveryDetails: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  trackingContainer: {
    marginTop: 50,
  },
  bigStepContainer: {
    marginBottom: 20,
  },
  bigStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#68C2FF',
    marginRight: 10,
  },
  bigStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  smallStepsContainer: {
    paddingLeft: 15, 
  },
  smallStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  smallStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#68C2FF',
    marginRight: 10,
  },
  smallStepText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
  },
});

export default Track;
