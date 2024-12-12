import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]); // State for all pets
  const [filteredPets, setFilteredPets] = useState([]); // State for filtered pets
  const [favoritedPets, setFavoritedPets] = useState([]); // Store full pet objects for favorites
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
    const unsubscribeFavorites = onSnapshot(
      doc(db, "users", user.uid),
      (userDoc) => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFavoritedPets(data.favorites || []); // Set favorited pets if they exist
        }
      }
    );

    // Real-time listener for pet requests from the current logged-in user
    const petRequestCollection = collection(db, "pet_request");
    const petRequestQuery = query(
      petRequestCollection,
      where("userId", "==", user.uid) // Filter by userId to get only the requested pets
    );

    const unsubscribeRequests = onSnapshot(petRequestQuery, (snapshot) => {
      const requestedPetList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequestedPets(requestedPetList); // Set requested pets to state
    });

    // Cleanup the listeners on component unmount
    return () => {
      unsubscribePets(); // Unsubscribe from pets collection listener
      unsubscribeFavorites(); // Unsubscribe from user's favorites listener
      unsubscribeRequests(); // Unsubscribe from pet requests listener
    };
  }, [db, user]);

  // Function to add a new pet to the Firestore and global state
  const addPet = async (newPet) => {
    try {
      // Add the new pet to Firestore collection
      const petCollection = collection(db, "listed_pets");
      const docRef = await addDoc(petCollection, newPet);

      // Once added to Firestore, update local state (global state)
      setPets((prevPets) => [...prevPets, { id: docRef.id, ...newPet }]);
      setFilteredPets((prevPets) => [
        ...prevPets,
        { id: docRef.id, ...newPet },
      ]);
    } catch (error) {
      console.error("Error adding pet: ", error);
    }
  };

  const cancelRequest = async (petName) => {
    if (!user) return;

    const requestsRef = collection(db, "pet_request");
    const q = query(
      requestsRef,
      where("adopterEmail", "==", user.email),
      where("petName", "==", petName),
      where("status", "==", "Pending")
    );

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id; // Get the first matching document's ID
        const requestRef = doc(db, "pet_request", docId);

        // Update the status to "Canceled"
        await updateDoc(requestRef, { status: "Canceled" });

        // Remove the canceled request from the local state
        setRequestedPets((prevRequests) =>
          prevRequests.filter((pet) => pet.petName !== petName)
        );
      } else {
        console.error("No pending request found for petName:", petName);
      }
    } catch (error) {
      console.error("Error canceling request: ", error);
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (petId, petData) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    if (favoritedPets.some((favPet) => favPet.id === petId)) {
      await updateDoc(userRef, {
        favorites: arrayRemove(petData),
      });
      setFavoritedPets((prev) => prev.filter((favPet) => favPet.id !== petId));
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(petData),
      });
      // Ensure the pet is not already in the favoritedPets state
      setFavoritedPets((prev) => {
        if (prev.some((favPet) => favPet.id === petId)) {
          return prev;
        }
        return [...prev, petData];
      });
    }
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
        filters.personality.some((trait) => pet.petPersonality.includes(trait))
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
        const [minFee, maxFee] = filters.adoptionFee.split("-").map(Number);
        filtered = filtered.filter(
          (pet) =>
            Number(pet.adoptionFee) >= minFee &&
            Number(pet.adoptionFee) <= maxFee
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
        applyFilters,
        setFilteredPets,
        favoritedPets,
        setFavoritedPets,
        toggleFavorite,
        requestedPets, // Provide requested pets (filtered by the current user)
        setRequestedPets,
        cancelRequest,
        addPet, // Provide addPet function to add a new pet
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
