import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]); // State for all pets
  const [filteredPets, setFilteredPets] = useState([]);
  const [favoritedPets, setFavoritedPets] = useState([]); // Store full pet objects
  const [requestedPets, setRequestedPets] = useState([]); // Store pets with pending requests
  const db = getFirestore(); // Firestore instance
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch pets from Firestore when the provider is mounted
  useEffect(() => {
    if (!user) {
      console.log("User not logged in. Skipping pet fetch.");
      return;
    }

    // Real-time listener for pets collection
    const petCollection = collection(db, "listed_pets");
    const unsubscribePets = onSnapshot(petCollection, (snapshot) => {
      const petList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petList); // Set fetched pets to state
      setFilteredPets(petList); // Initialize filteredPets with full list
    });

    // Real-time listener for user's favorites
    const unsubscribeFavorites = onSnapshot(doc(db, "users", user.uid), (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFavoritedPets(data.favorites || []); // Set favorited pets if they exist
      }
    });

    // Cleanup the listeners on component unmount
    return () => {
      unsubscribePets(); // Unsubscribe from pets collection listener
      unsubscribeFavorites(); // Unsubscribe from user's favorites listener
    };
  }, [db, user]);

  // Function to fetch pets with "pending" requests by the current user
  const fetchRequestedPets = async () => {
    if (!user) {
      console.log("User not logged in. Cannot fetch requested pets.");
      return;
    }
  
    try {
      console.log("Fetching requested pets for user:", user.email);
  
      // Reference to the user's pet request document
      const userDocRef = doc(db, "pet_request", user.email); // Ensure this matches your Firestore doc ID
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        console.log("User Doc Data:", userDoc.data()); // Log the document data for debugging
        const requests = userDoc.data().requests || []; // Ensure requests field exists and is an array
        console.log("Fetched requests:", requests);
        
        const pendingRequests = requests.filter(
          (request) =>
            request.status === "Pending" && request.adopterEmail === user.email
        );
  
        console.log("Filtered pending requests:", pendingRequests);
        setRequestedPets(pendingRequests); // Set the filtered requests state
      } else {
        console.log("No requests found for the current user.");
        setRequestedPets([]); // No pending requests found, clear state
      }
    } catch (error) {
      console.error("Error fetching requested pets:", error);
    }
  };     

  // Function to toggle favorite status of a pet
  const toggleFavorite = async (petId, petData) => {
    if (!user) {
      console.log("User is not logged in. Cannot toggle favorite.");
      return;
    }

    const userRef = doc(db, "users", user.uid); // Reference to the user's document

    if (favoritedPets.some((favPet) => favPet.id === petId)) {
      // If already favorited, remove it
      await updateDoc(userRef, {
        favorites: arrayRemove(petData), // Remove from favorites
      });
      setFavoritedPets((prevFavorited) =>
        prevFavorited.filter((favPet) => favPet.id !== petId)
      );
    } else {
      // If not favorited, add it
      await updateDoc(userRef, {
        favorites: arrayUnion(petData), // Add to favorites
      });
      setFavoritedPets((prevFavorited) => [...prevFavorited, petData]);
    }
  };

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
      filtered = filtered.filter(
        (pet) => Number(pet.petAge) === Number(filters.age)
      );
    }

    if (filters.weight) {
      filtered = filtered.filter(
        (pet) => Number(pet.petWeight) === Number(filters.weight)
      );
    }

    if (filters.personality && filters.personality.length > 0) {
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

    if (filters.petType) {
      filtered = filtered.filter((pet) => pet.petType === filters.petType);
    }

    if (filters.adoptionFee) {
      if (filters.adoptionFee === "1001-1200") {
        filtered = filtered.filter((pet) => Number(pet.adoptionFee) > 1000);
      } else {
        const [minFee, maxFee] = filters.adoptionFee.split('-').map(Number);
        filtered = filtered.filter(
          (pet) => Number(pet.adoptionFee) >= minFee && Number(pet.adoptionFee) <= maxFee
        );
      }
    }

    setFilteredPets(filtered); // Update filtered pets list
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        filteredPets,
        setPets,
        addPet,
        applyFilters,
        setFilteredPets,
        favoritedPets,
        toggleFavorite,
        requestedPets, // Add requestedPets to the context
        setRequestedPets, // Add setter to the context
        fetchRequestedPets, // Expose the new function
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePets = () => {
  return useContext(PetContext);
};

export default PetProvider;