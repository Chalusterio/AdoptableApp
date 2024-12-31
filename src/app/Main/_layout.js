import React from "react";
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";
import { useNotifications } from "../../context/NotificationContext";

const Main = () => {
  const { hasUnreadNotifications, role, markNotificationsAsRead, userEmail } = useNotifications();  // Now you get markNotificationsAsRead

  // Pass the appropriate notification state to TabBar based on the role
  const hasUnreadNotificationsForRole = role === "adopter" ? hasUnreadNotifications : role === "lister" ? hasUnreadNotifications : false;

  return (
    <Tabs
      tabBar={(props) => (
        <TabBar
          {...props}
          hasUnreadNotifications={hasUnreadNotificationsForRole}
          markNotificationsAsRead={markNotificationsAsRead}  // Passing the function
          userEmail={userEmail}  // Pass userEmail
          role={role}  // Pass role
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: "Home", headerShown: false }} />
      <Tabs.Screen name="Track" options={{ title: "Track", headerShown: false }} />
      <Tabs.Screen name="List" options={{ title: "List", headerShown: false }} />
      <Tabs.Screen name="Notification" options={{ title: "Notifications", headerShown: false }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile", headerShown: false }} />
    </Tabs>
  );
};

export default Main;
