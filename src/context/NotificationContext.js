import React, { createContext, useState, useEffect, useContext } from "react";
import { collection, query, where, onSnapshot, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Firebase setup import
import { auth } from "../../firebase"; // Assuming you have auth setup
import { onAuthStateChanged } from "firebase/auth";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false); // General unread notifications
  const [role, setRole] = useState(null); // Role: adopter or lister
  const [userEmail, setUserEmail] = useState(null);  // Track user email
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);  // Save user email
        console.log("User logged in:", user.email);

        // Query to check if the user is an adopter or a lister
        const qAdopter = query(
          collection(db, "pet_request"),
          where("adopterEmail", "==", user.email) // Check if user is adopter
        );

        const qLister = query(
          collection(db, "pet_request"),
          where("listedBy", "==", user.email) // Check if user is lister
        );

        // First, check if the user is an adopter
        const unsubscribeAdopter = onSnapshot(
          qAdopter,
          (snapshot) => {
            if (!snapshot.empty) {
              setRole("adopter");
              let hasUnread = false;
              snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.adopterNotificationRead === false) {
                  hasUnread = true; // Found unread notification
                }
              });
              setHasUnreadNotifications(hasUnread); // Update unread notification state
            }
          },
          (error) => {
            console.error("Error checking adopter notifications:", error);
          }
        );

        // Then, check if the user is a lister
        const unsubscribeLister = onSnapshot(
          qLister,
          (snapshot) => {
            if (!snapshot.empty) {
              setRole("lister");
              let hasUnread = false;
              snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.listerNotificationRead === false) {
                  hasUnread = true; // Found unread notification
                }
              });
              setHasUnreadNotifications(hasUnread); // Update unread notification state
            }
          },
          (error) => {
            console.error("Error checking lister notifications:", error);
          }
        );

        // Clean up listeners on unmount or user logout
        return () => {
          unsubscribeAdopter();
          unsubscribeLister();
        };
      } else {
        console.log("No user is logged in.");
        setUserEmail(null);  // Clear the email if no user is logged in
        setRole(null);  // Clear the role if no user is logged in
        setHasUnreadNotifications(false); // Reset unread notifications
      }
    });

    return () => {
      unsubscribeAuth();  // Stop listening for auth state changes
    };
  }, []);  // Empty dependency array so this effect runs on mount and unmount

  const markNotificationsAsRead = async (userEmail, role) => {
    if (!userEmail || !role) {
      console.error("Invalid userEmail or role:", userEmail, role);
      return;
    }
  
    try {
      const queryRef = role === "adopter" 
        ? query(collection(db, "pet_request"), where("adopterEmail", "==", userEmail))
        : query(collection(db, "pet_request"), where("listedBy", "==", userEmail));
  
      const snapshot = await getDocs(queryRef);
  
      if (!snapshot.empty) {
        snapshot.docs.forEach(async (doc) => {
          const docRef = doc.ref;
          const updateData = role === "adopter" 
            ? { adopterNotificationRead: true }
            : { listerNotificationRead: true };
  
          await updateDoc(docRef, updateData)
            .then(() => {
              console.log("Notification marked as read for docId:", doc.id);
              // Update state for only this specific notification
              setNotifications(prevNotifications => 
                prevNotifications.map((notif) => 
                  notif.id === doc.id ? { ...notif, read: true } : notif
                )
              );
            })
            .catch((error) => {
              console.error("Error updating notification read status:", error);
            });
        });
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Log the updated states after they change
  useEffect(() => {
    console.log("Has unread notifications:", hasUnreadNotifications);
    console.log("User role:", role);
  }, [hasUnreadNotifications, role]); // Log after state update

  return (
    <NotificationContext.Provider value={{ hasUnreadNotifications, role, markNotificationsAsRead, userEmail }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.error("useNotifications must be used within a NotificationProvider.");
    throw new Error("useNotifications must be used within a NotificationProvider.");
  }
  return context;
};
