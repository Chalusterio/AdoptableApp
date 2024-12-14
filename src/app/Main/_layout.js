<<<<<<< Updated upstream
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
=======
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";
import PetProvider from "../../context/PetContext";
import UserProvider from "../../context/UserContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Main = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <PetProvider>
            {/* Wrap the Tabs within the SideBar */}
            <Tabs tabBar={(props) => <TabBar {...props} />}>
              <Tabs.Screen
                name="index"
                options={{
                  title: "Feed",
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
        </PetProvider>
      </UserProvider>
    </GestureHandlerRootView>
>>>>>>> Stashed changes
  );
};

export default Main;