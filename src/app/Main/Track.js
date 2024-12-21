import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PetCard = ({ pet, onToggle, isExpanded, trackingStatus, currentUserEmail }) => {
  const bigSteps = [
    { title: 'Application Approved', icon: <MaterialIcons name="check-circle" size={24} /> },
    { title: 'Getting Ready', icon: <MaterialIcons name="build-circle" size={24} /> },
    { title: 'In Transit to New Home', icon: <MaterialIcons name="local-shipping" size={24} /> },
    { title: 'On the Way', icon: <MaterialIcons name="directions-car" size={24} /> },
    { title: 'Welcome Home!', icon: <MaterialIcons name="home" size={24} /> },
  ];

  // Determine the current step based on trackingStatus
  const stepStatus = {
    "Preparing": [0, 1],  // Steps 1 and 2
    "In-transit": [0, 1, 2],  // Steps 1, 2, and 3
    "On-the-way": [0, 1, 2, 3],  // Steps 1, 2, 3, and 4
    "Arrived": [0, 1, 2, 3, 4],  // All steps
  };

  const currentSteps = stepStatus[trackingStatus] || []; // Default to no steps

  return (
    <TouchableOpacity onPress={onToggle} style={styles.petCard}>
      <View style={styles.rowContainer}>
        <View style={styles.petImageContainer}>
          <Image source={{ uri: pet.image }} style={styles.petImage} />
        </View>
        <View style={styles.petDetailsContainer}>
          <Text style={styles.petName}>{pet.name}   {pet.listedBy === currentUserEmail && (
            <Text style={styles.listedByText}>Listed by you</Text> // Indicator for listed pet
          )}</Text>
          <Text style={styles.petDetails}>{pet.age} years | {pet.weight} kg</Text>

          <View style={styles.deliveryDetailBox}>
            <Text style={styles.deliveryDetails}>Amount: ₱ {pet.totalAmount}</Text>
          </View>
        </View>
      </View>

      {isExpanded && (
        <>
          <View style={styles.trackingContainer}>
            {/* Delivery Type and Expected Date */}
            <View style={styles.deliveryDetailsContainer}>
              <Text style={styles.deliveryType}>Delivery Type: {pet.deliveryType}</Text>
              <Text style={styles.expectedDate}>Expected Date: {pet.expectedDate}</Text>
            </View>

            <View style={styles.bigStepContainer}>
              {bigSteps.map((step, index) => (
                <View key={index} style={styles.bigStepRow}>
                  <View style={[styles.iconContainer, { backgroundColor: currentSteps.includes(index) ? '#68C2FF' : '#ddd' }]} >
                    {step.icon}
                  </View>
                  <Text style={styles.bigStepTitle}>{step.title}</Text>
                </View>
              ))}
            </View>
          </View>

        </>
      )}
    </TouchableOpacity>
  );
};


const Track = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [adopterPets, setAdopterPets] = useState([]); // State for adopter's pets
  const [listerPets, setListerPets] = useState([]);   // State for lister's pets
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUserEmail(user.email);
      console.log('Logged-in user email:', user.email);
    } else {
      console.error('No user logged in.');
    }
  }, []);

  useEffect(() => {
    if (currentUserEmail) {
      console.log('Fetching finalized adoptions for:', currentUserEmail);

      // Fetch finalized adoptions for adopter
      const finalizedAdoptionRef = collection(db, 'finalized_adoption');
      const finalizedAdoptionQuery = query(
        finalizedAdoptionRef,
        where('status', '==', 'finalized'),
        where('petRequestDetails.adopterEmail', '==', currentUserEmail) // For adopter
      );

      const unsubscribeAdopter = onSnapshot(finalizedAdoptionQuery, (finalizedAdoptionSnapshot) => {
        const petData = [];
        finalizedAdoptionSnapshot.forEach((docSnapshot) => {
          const adoptionData = docSnapshot.data();
          const petRequestDetails = adoptionData.petRequestDetails;
          const petId = petRequestDetails.petName;  // Correct the property reference here
          console.log('Adopted Pet ID:', petId);

          const petRef = collection(db, 'listed_pets');
          const petQuery = query(petRef, where('petName', '==', petId));

          onSnapshot(petQuery, (petSnapshot) => {
            petSnapshot.forEach((petDoc) => {
              const petDetails = petDoc.data();
              console.log('Fetched Pet Details:', petDetails);
              petData.push({
                id: petDoc.id,
                name: petDetails.petName,
                age: petDetails.petAge,
                weight: petDetails.petWeight,
                image: petDetails.images[0],
                totalAmount: adoptionData.totalAmount,
                deliveryType: adoptionData.deliveryDetails?.type,
                expectedDate: adoptionData.deliveryDetails?.expectedDate,
                trackingStatus: adoptionData.tracking_status,
              });
            });
            setAdopterPets(petData); // Update state with fetched pets for adopter
          });
        });
      });

      // Fetch finalized adoptions for lister
      const finalizedAdoptionQueryLister = query(
        finalizedAdoptionRef,
        where('status', '==', 'finalized'),
        where('petRequestDetails.listedBy', '==', currentUserEmail) // For lister
      );

      const unsubscribeLister = onSnapshot(finalizedAdoptionQueryLister, (finalizedAdoptionSnapshot) => {
        const petData = [];
        finalizedAdoptionSnapshot.forEach((docSnapshot) => {
          const adoptionData = docSnapshot.data();
          const petRequestDetails = adoptionData.petRequestDetails;
          const petId = petRequestDetails.petName;
          console.log('Lister Pet ID:', petId);

          const petRef = collection(db, 'listed_pets');
          const petQuery = query(petRef, where('petName', '==', petId));

          onSnapshot(petQuery, (petSnapshot) => {
            petSnapshot.forEach((petDoc) => {
              const petDetails = petDoc.data();
              console.log('Fetched Pet Details for Lister:', petDetails);
              petData.push({
                id: petDoc.id,
                name: petDetails.petName,
                age: petDetails.petAge,
                weight: petDetails.petWeight,
                image: petDetails.images[0],
                totalAmount: adoptionData.totalAmount,
                deliveryType: adoptionData.deliveryDetails?.type,
                expectedDate: adoptionData.deliveryDetails?.expectedDate,
                trackingStatus: adoptionData.tracking_status,
                listedBy: petDetails.listedBy, // Ensure listedBy is included
              });
            });
            setListerPets(petData); // Update state with fetched pets for lister
          });
        });
      });

      // Cleanup listeners when component unmounts or currentUserEmail changes
      return () => {
        unsubscribeAdopter();
        unsubscribeLister();
      };
    }
  }, [currentUserEmail]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Track Your Pets</Text>
      {/* Conditionally render adopter or lister pets */}
      {currentUserEmail && (
        <>
          {adopterPets.length === 0 && listerPets.length === 0 ? (
            <View style={styles.noPetsContainer}>
              <Text style={styles.noPetsText}>No pets to track</Text>
            </View>
          ) : (
            <>
              {adopterPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  isExpanded={expandedCard === pet.id}
                  onToggle={() => setExpandedCard(prev => (prev === pet.id ? null : pet.id))}
                  trackingStatus={pet.trackingStatus}
                  currentUserEmail={currentUserEmail}
                />
              ))}
              {listerPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  isExpanded={expandedCard === pet.id}
                  onToggle={() => setExpandedCard(prev => (prev === pet.id ? null : pet.id))}
                  trackingStatus={pet.trackingStatus}
                  currentUserEmail={currentUserEmail}
                />
              ))}
            </>
          )}
        </>
      )}
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
    fontSize: 25,
    fontFamily: 'Lilita',
    color: '#68C2FF',
    marginTop: 20,
    marginBottom: 30,
  },
  noPetsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 200,
  },
  noPetsText: {
    fontSize: 20  ,
    color: '#777',
    textAlign: 'center',
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
    marginBottom: 10,
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
  deliveryDetailBox: {
    borderWidth: 2,
    borderColor: '#68C2FF',
    borderRadius: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 0,
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
    color: '#333',
  },
  listedByText: {
    fontSize: 14,
    color: '#EF5B5B',
    fontWeight: 'bold',
    marginTop: 5,
  },

});

export default Track;
