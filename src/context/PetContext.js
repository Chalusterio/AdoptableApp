import React, { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]); // State for pets
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
        ...doc.data(), // Fetches all fields including petType
      }));
      setPets(petList); // Set fetched pets to state
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [db]);

  // Function to add a new pet locally (optional)
  const addPet = (pet) => {
    setPets((prevPets) => [...prevPets, pet]);
  };

  return (
    <PetContext.Provider value={{ pets, setPets, addPet }}>
      {children}
    </PetContext.Provider>
  );
};

// Hook for accessing pet data and functions
export const usePets = () => useContext(PetContext);

export default PetProvider;
