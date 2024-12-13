import { Tabs } from 'expo-router';
import React from 'react';
import { useNotifications } from '../../context/NotificationContext'; // Adjust path
import TabBar from '../../components/TabBar';

const Main = () => {
  const { unreadCount, markAsRead } = useNotifications();

  const handleNotificationTabPress = () => {
    markAsRead();
  };

  return (
    <Tabs tabBar={(props) => <TabBar {...props} newNotification={unreadCount > 0} />}>
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