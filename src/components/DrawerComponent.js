import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DrawerComponent(props) {
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const handleLogout = async () => {
    router.replace('/'); // Navigate back to the login screen
  };

  return (
    <DrawerContentScrollView
      {...props} // Ensure props are passed to enable navigation
      contentContainerStyle={{ paddingTop: top }}
    >
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
        />
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="logout" color="red" size={size} />
        )}
        labelStyle={{ color: 'red' }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
});
