import React, { createContext, useContext, useState } from "react";

const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);

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