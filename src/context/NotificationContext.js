import React, { createContext, useState, useContext, useEffect } from "react";
import { db, auth } from "../../../firebase";
import { collection, query, getDocs, where, onSnapshot, setDoc, doc } from "firebase/firestore";
import { useRouter } from "expo-router";
import moment from "moment";

// Create a context for notifications
const NotificationContext = createContext();

// Custom hook to use the NotificationContext
export const useNotifications = () => {
  return useContext(NotificationContext);
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const petRequestsQuery = query(
      collection(db, "pet_request"),
      where("status", "in", ["Pending", "Accepted", "Rejected"])
    );

    const unsubscribe = onSnapshot(petRequestsQuery, async (querySnapshot) => {
      const notificationsList = [];
      const userEmailsToFetch = new Set();

      querySnapshot.forEach((doc) => {
        const petRequest = doc.data();

        // Collect adopter and lister email to fetch details later
        if (!users[petRequest.adopterEmail]) {
          userEmailsToFetch.add(petRequest.adopterEmail);
        }

        if (!users[petRequest.listedBy]) {
          userEmailsToFetch.add(petRequest.listedBy);
        }

        const adopter = users[petRequest.adopterEmail] || {};
        const petLister = users[petRequest.listedBy] || {};

        let formattedTime = "";
        if (petRequest.status === "Pending") {
          formattedTime = moment(petRequest.requestDate.seconds * 1000).fromNow();
        } else if (petRequest.status === "Accepted") {
          formattedTime = moment(petRequest.acceptDate.seconds * 1000).fromNow();
        } else if (petRequest.status === "Rejected") {
          formattedTime = moment(petRequest.rejectDate.seconds * 1000).fromNow();
        }

        // Handle Pending Request Notification
        if (petRequest.status === "Pending" && currentUser.email === petRequest.listedBy) {
          const notification = {
            id: doc.id,
            image: adopter.profilePicture ? { uri: adopter.profilePicture } : null,
            name: adopter.name || "Adopter",
            content: `has requested to adopt your pet ${petRequest.petName}.`,
            time: formattedTime,
            action: () =>
              router.push({
                pathname: "/Screening",
                params: {
                  adopterEmail: petRequest.adopterEmail,
                  petRequestId: doc.id,
                  petName: petRequest.petName,
                },
              }),
            read: false, // Ensuring notifications are marked as unread initially
          };

          notificationsList.push(notification);
          storeNotification(doc.id, petRequest, currentUser.email, false);
        }

        // Handle Accepted or Rejected Request Notification
        if (currentUser.email === petRequest.listedBy && ["Accepted", "Rejected"].includes(petRequest.status)) {
          const message =
            petRequest.status === "Accepted"
              ? `You have accepted ${adopter.name || "the adopter"}'s request to adopt ${petRequest.petName}.`
              : `You have rejected ${adopter.name || "the adopter"}'s request to adopt ${petRequest.petName}.`;

          notificationsList.push({
            id: `${doc.id}-${petRequest.status}`,
            image: require("../../assets/Icon_white.png"),
            name: "System Notification",
            content: message,
            time: formattedTime,
            action: null,
            read: false, // Ensuring notifications are marked as unread initially
          });

          storeNotification(`${doc.id}-${petRequest.status}`, petRequest, currentUser.email, false);
        }

        // Handle Accepted Request for Adopter Notification
        if (petRequest.status === "Accepted" && currentUser.email === petRequest.adopterEmail) {
          const notification = {
            id: doc.id,
            image: petLister.profilePicture ? { uri: petLister.profilePicture } : null,
            name: petLister.name || "Pet Lister",
            content: `${petLister.name || "Pet Lister"} has accepted your request to adopt ${petRequest.petName}.`,
            time: formattedTime,
            action: () =>
              router.push({
                pathname: "/ApproveAdoption",
                params: {
                  petRequestId: doc.id,
                  petName: petRequest.petName,
                  listedBy: petRequest.listedBy,
                },
              }),
            read: false, // Ensuring notifications are marked as unread initially
          };

          notificationsList.push(notification);
          storeNotification(doc.id, petRequest, currentUser.email, false);
        }

        // Handle Rejected Request for Adopter Notification
        if (petRequest.status === "Rejected" && currentUser.email === petRequest.adopterEmail) {
          const notification = {
            id: doc.id,
            image: petLister.profilePicture ? { uri: petLister.profilePicture } : null,
            name: petLister.name || "Pet Lister",
            content: `${petLister.name || "Pet Lister"} has rejected your adoption request for ${petRequest.petName}.`,
            time: formattedTime,
            action: null,
            read: false, // Ensuring notifications are marked as unread initially
          };

          notificationsList.push(notification);
          storeNotification(doc.id, petRequest, currentUser.email, false);
        }
      });

      // Fetch user details in parallel for all missing emails
      const missingUsers = Array.from(userEmailsToFetch);
      for (const email of missingUsers) {
        const userDetails = await fetchUserDetails(email);
        if (userDetails) {
          setUsers((prev) => ({
            ...prev,
            [email]: userDetails,
          }));
        }
      }

      notificationsList.sort((a, b) => b.time.localeCompare(a.time));
      setNotifications(notificationsList);

      // Update unread count
      const unreadNotifications = notificationsList.filter((notif) => !notif.read).length;
      setUnreadCount(unreadNotifications);
    });

    return () => unsubscribe();
  }, [currentUser, users]);

  const fetchUserDetails = async (email) => {
    try {
      const usersQuery = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        return {
          name: userDoc.name,
          profilePicture: userDoc.profilePicture || null,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details: ", error);
      return null;
    }
  };

  const storeNotification = async (notificationId, petRequest, userEmail, read) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
  
      console.log("Storing notification with ID:", notificationId); // Log for debugging
      await setDoc(notificationRef, {
        petRequestId: notificationId,
        status: petRequest.status,
        userEmail: userEmail,
        petName: petRequest.petName,
        timestamp: petRequest.requestDate || new Date(),
        read: read, // Ensuring notifications are unread initially
      });
  
      console.log("Notification stored successfully!"); // Success log
    } catch (error) {
      console.error("Error storing notification: ", error); // More descriptive error
    }
  };
  
  const markAsRead = async (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );

    // Update Firestore to mark as read
    await setDoc(doc(db, "notifications", notificationId), { read: true }, { merge: true });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationProvider };
