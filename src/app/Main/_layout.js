import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";
import { useNotifications } from "../../context/NotificationContext";

const Main = () => {
  const { newNotificationsCount, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (newNotificationsCount > 0) {
      // Mark all notifications as read when the Notification tab is clicked
      markAllAsRead();
    }
  }, [newNotificationsCount, markAllAsRead]);

  return (
    <Tabs
      tabBar={(props) => (
        <TabBar {...props} notificationCount={newNotificationsCount} />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Track"
        options={{
          title: "Track",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="List"
        options={{
          title: "List",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Notification"
        options={{
          title: "Notifications",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default Main;
