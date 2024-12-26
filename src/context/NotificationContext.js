import React, { createContext, useState, useContext, useEffect } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db, auth } from "../../firebase";

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const notificationsQuery = collection(db, "notifications");

    const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
      const notificationsList = [];
      let unreadCount = 0;
      querySnapshot.forEach((doc) => {
        const notification = doc.data();
        if (notification.isRead === false) {
          unreadCount++;
        }
        notificationsList.push(notification);
      });

      setNotifications(notificationsList);
      setNewNotificationsCount(unreadCount);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        newNotificationsCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
