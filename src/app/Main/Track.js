import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Bruno from '../../assets/Track/bruno.jpg';
import Shiro from '../../assets/Track/shiro.jpg';

const PetCard = ({ pet, onToggle, isExpanded }) => {
  const currentStep = 1; // Current step for tracking (mock data)
  const bigSteps = [
    { title: 'Preparing', icon: <MaterialIcons name="build-circle" size={24} /> },
    { title: 'Transporting', icon: <MaterialIcons name="local-shipping" size={24} /> },
    { title: 'Out for Delivery', icon: <MaterialIcons name="directions-car" size={24} /> },
    { title: 'Delivered', icon: <MaterialIcons name="home" size={24} /> },
  ];

  const smallSteps = {
  Preparing: [
    { step: 'Adoption Request being reviewed', time: '10:00 AM', date: 'Dec 14, 2024' },
    { step: 'Preparing for delivery', time: '12:00 PM', date: 'Dec 14, 2024' },
  ],
  Transporting: [
    { step: 'Car ready for delivery', time: '2:00 PM', date: 'Dec 14, 2024' },
    { step: 'Your pet has arrived in a resting stop', time: '4:00 PM', date: 'Dec 14, 2024' },
  ],
  'Out for Delivery': [],
  Delivered: [],
};


  return (
    <TouchableOpacity onPress={onToggle} style={styles.petCard}>
      {/* Pet Image and Details in Row */}
      <View style={styles.rowContainer}>
        <View style={styles.petImageContainer}>
          <Image source={pet.image} style={styles.petImage} />
        </View>
        
        <View style={styles.petDetailsContainer}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petDetails}>{pet.age} | {pet.weight}</Text>
          <View style={styles.deliveryBox}>
            
            <View style={styles.deliveryDetailBox}>
              <Text style={styles.deliveryDetails}>Amount: ₱ {pet.totalAmount}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tracking Steps (Expandable Section) */}
      {isExpanded && (
        <View style={styles.trackingContainer}>
          <View style={styles.deliveryDetailsContainer}>
            <Text style={styles.deliveryType}>Delivery Type: {pet.deliveryType}</Text>
            <Text style={styles.trackingNumber}>Tracking Number: SPEAJB4562131</Text>
          </View>
          {bigSteps.map((step, index) => (
            <View key={index} style={styles.bigStepContainer}>
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
              {index <= currentStep && smallSteps[step.title]?.length > 0 && (
                <View style={styles.smallStepsContainer}>
                  {smallSteps[step.title].map((smallStep, i) => (
                    <View key={i} style={styles.smallStep}>
                      <View style={styles.smallStepDot} />
                      <View style={styles.textContainer}>
                        <Text style={styles.smallStepText}>{smallStep.step}</Text>
                        <Text style={styles.timeAndDate}>{`${smallStep.time} | ${smallStep.date}`}</Text>
                      </View>
                    </View>
                  ))}
                </View>

              )}
            </View>
          ))}
          <TouchableOpacity style={styles.cancelButton} onPress={() => alert('Adoption canceled')}>
            <Text style={styles.cancelButtonText}>Cancel Adoption</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
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
    marginTop: 50,
    marginBottom: 30,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 30,
    padding: 20,
    // Shadow for iOS
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,   
      height: 0, 
    },
    shadowOpacity: 0.2,  
    shadowRadius: 6,    
    // Shadow for Android
    elevation: 5,  
  },
  rowContainer: {
    flexDirection: 'row',  
  },
  petImageContainer: {
    flex: 1,
    marginRight: 20,
  },
  petImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  petDetailsContainer: {
    flex: 2,
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
  deliveryDetailsContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#C2C2C2',
    paddingBottom: 10,
    marginBottom: 20, // Optional: for spacing between elements
  },
  deliveryType: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#666',
  },
  deliveryBox: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryDetailBox: {
    borderWidth: 2,
    borderColor: '#68C2FF',
    borderRadius: 20,
    paddingVertical: 10 ,
    paddingHorizontal: 10,
    flex: 1,
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
    marginVertical: 8, 
  },
  smallStepDot: {
    width: 9, 
    height: 9,
    borderRadius: 4, 
    backgroundColor: '#68C2FF',
    marginRight: 25, 
  },
  textContainer: {
    flexDirection: 'column', 
    justifyContent: 'center',
  },
  smallStepText: {
    fontSize: 12,
    color: '#666',
  },
  timeAndDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2, 
  },
});

export default Track;
