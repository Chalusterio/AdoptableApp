import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DrawerComponent from '../../components/DrawerComponent';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <DrawerComponent {...props} />}
        screenOptions={{
          drawerActiveTintColor: 'white',
          drawerActiveBackgroundColor: '#555',
          drawerInactiveTintColor: 'black',
          drawerInactiveBackgroundColor: 'transparent',
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
            drawerIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'home' : 'home-outline'}
                color={focused ? 'white' : color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Favorites"
          options={{
            drawerLabel: 'Favorites',
            title: 'Favorites',
            drawerIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'heart' : 'heart-outline'}
                color={focused ? 'white' : color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Donate"
          options={{
            drawerLabel: 'Donate',
            title: 'Donate',
            drawerIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'hand-coin' : 'hand-coin-outline'}
                color={focused ? 'white' : color}
                size={size}
              />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
