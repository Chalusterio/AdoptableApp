import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import CustomTabBarButton from '../../components/CustomTabBarButton'; // Import CustomTabBarButton

const Main = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBarStyle, // Apply borderRadius and other styles here
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton isFocused={focused} label="Adopt" icon="paw" />
          ),
        }}
      />
      <Tabs.Screen
        name="Track"
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton isFocused={focused} label="Track" icon="truck" />
          ),
        }}
      />
      <Tabs.Screen
        name="List"
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton isFocused={focused} icon="plus-circle-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="Notification"
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton isFocused={focused} label="Notifications" icon="bell" />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton isFocused={focused} label="Profile" icon="account" />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#68C2FF',
    height: 70,
    overflow: 'hidden',
    paddingHorizontal: 15,
  },
  tabBarItemStyle: {
    flex: 1, // Ensure items take equal width
    paddingVertical: 15,
  },
});

export default Main;
