import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { collection, query, onSnapshot, where, updateDoc, doc } from 'firebase/firestore';
import TabBar from '../../components/TabBar';

const Main = () => {
  const [newNotification, setNewNotification] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      // Filter notifications for the current user
      const petRequestsQuery = query(
        collection(db, 'notifications'),
        where('read', '==', false),
        where('userEmail', '==', user.email) // Ensure notifications belong to the logged-in user
      );

      const unsubscribe = onSnapshot(petRequestsQuery, (querySnapshot) => {
        let unreadNotifications = querySnapshot.size; // Count unread notifications directly
        setNewNotification(unreadNotifications > 0);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleNotificationTabPress = () => {
    const user = auth.currentUser;

    if (user) {
      // Fetch unread notifications for the current user
      const petRequestsQuery = query(
        collection(db, 'notifications'),
        where('read', '==', false),
        where('userEmail', '==', user.email) // Ensure updates are scoped to the logged-in user
      );

      const unsubscribe = onSnapshot(petRequestsQuery, (querySnapshot) => {
        querySnapshot.forEach((docSnapshot) => {
          const docRef = doc(db, 'notifications', docSnapshot.id);

          // Mark notification as read
          updateDoc(docRef, { read: true }).catch((error) =>
            console.error('Error marking notification as read:', error)
          );
        });

        setNewNotification(false); // Hide badge
      });

      return () => unsubscribe(); // Cleanup listener
    }
  };

  return (
    <Tabs tabBar={(props) => <TabBar {...props} newNotification={newNotification} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Track"
        options={{
          title: 'Track',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="List"
        options={{
          title: 'List',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Notification"
        options={{
          title: 'Notifications',
          headerShown: false,
        }}
        listeners={{
          tabPress: handleNotificationTabPress, // Mark notifications as read on tab click
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default Main;
