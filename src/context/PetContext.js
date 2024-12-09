import React, { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, collection, getDocs, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]); // State for pets
  const [filteredPets, setFilteredPets] = useState([]);
  const db = getFirestore(); // Firestore instance

  // Fetch pets from Firestore when the provider is mounted
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("User not logged in. Skipping pet fetch.");
      return; // Skip fetching if user is not authenticated
    }

    // Real-time listener for pets collection
    const petCollection = collection(db, "listed_pets");
    const unsubscribe = onSnapshot(petCollection, (snapshot) => {
      const petList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petList); // Set fetched pets to state
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [db]);

  // Function to add a new pet locally (optional)
  const addPet = (pet) => {
    setPets((prevPets) => {
      const updatedPets = [...prevPets, pet];
      setFilteredPets(updatedPets); // Update filteredPets with new pet
      return updatedPets;
    });
  };

  // Apply filters to the pets list
  const applyFilters = (filters) => {
    let filtered = pets;

    if (filters.gender) {
      filtered = filtered.filter((pet) => pet.petGender === filters.gender);
    }

    if (filters.age) {
      filtered = filtered.filter((pet) => Number(pet.petAge) === Number(filters.age));
    }

    if (filters.weight) {
      filtered = filtered.filter((pet) => pet.petWeight === filters.weight);
    }

    if (filters.personality.length > 0) {
      filtered = filtered.filter((pet) =>
        filters.personality.some((trait) =>
          pet.petPersonality.includes(trait)
        )
      );
    }

    if (filters.vaccinated !== null) {
      filtered = filtered.filter(
        (pet) => pet.petVaccinated === filters.vaccinated
      );
    }

    setFilteredPets(filtered); // Update filtered pets list
  };

  return (
    <PetContext.Provider value={{ pets, filteredPets, setPets, addPet, applyFilters }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePets = () => {
  return useContext(PetContext);
};

export default PetProvider;