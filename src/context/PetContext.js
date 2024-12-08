// Import necessary hooks and components from React
import React, { createContext, useContext, useState } from "react";

// Create a new context to hold pet-related data and functions
const PetContext = createContext();

// PetProvider component that wraps the app and provides the pet data
export const PetProvider = ({ children }) => {
  // State to hold the array of pets
  const [pets, setPets] = useState([]);

  // Function to add a new pet to the state
  const addPet = (pet) => {
    setPets((prevPets) => [...prevPets, pet]); // Adds a new pet to the list of pets
  };

  // The PetContext.Provider is used to pass down the pets, setPets, and addPet function
  return (
    <PetContext.Provider value={{ pets, setPets, addPet }}>
      {children}
    </PetContext.Provider>
  );
};

// Custom hook to access the PetContext values in any component
export const usePets = () => {
  return useContext(PetContext); // Returns the value of the context (pets, setPets, addPet)
};

// Export the PetProvider as default for easier use
export default PetProvider;
