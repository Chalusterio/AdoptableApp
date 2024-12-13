import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { auth, db } from "firebase/auth";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const petRequestsQuery = query(
      collection(db, "pet_request"),
      where("status", "in", ["Pending", "Accepted", "Rejected"])
    );

    const unsubscribe = onSnapshot(petRequestsQuery, (snapshot) => {
      const updatedNotifications = [];
      let unreadCount = 0;

      snapshot.forEach((doc) => {
        const petRequest = doc.data();
        const isUnread = !petRequest.read && petRequest.userEmail === user.email;

        if (isUnread) unreadCount++;

        updatedNotifications.push({
          id: doc.id,
          ...petRequest,
        });
      });

      setNotifications(updatedNotifications);
      setUnreadCount(unreadCount);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
