import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const TabBar = ({ state, descriptors, navigation, notificationCount }) => {
  const activeColor = '#68C2FF'; // Color for active tab
  const inactiveColor = '#FFF'; // Color for inactive tab

  const [fontsLoaded] = useFonts({
    Lilita: require('../assets/fonts/LilitaOne-Regular.ttf'), // Custom font
  });

  if (!fontsLoaded) {
    return null; // Return null while fonts are loading
  }

  const icons = {
    index: 'paw',
    Track: 'truck',
    List: 'plus-circle-outline',
    Notification: 'bell',
    Profile: 'account',
  };

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            style={[styles.tabbarItem, isFocused && styles.tabbarItemActive]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={icons[route.name]}
                size={30}
                color={isFocused ? activeColor : inactiveColor}
              />
              {/* Show badge only when there are notifications */}
              {route.name === 'Notification' && notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
              {isFocused && route.name !== 'List' && (
                <Text
                  style={[styles.activeText, { fontFamily: 'Lilita', fontSize: 15 }]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// TabBar styles (same as before)
const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#68C2FF',
    borderTopWidth: 1,
    borderColor: 'transparent',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingLeft: 25,
    paddingRight: 25,
  },
  tabbarItem: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  tabbarItemActive: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingVertical: 8,
    flexDirection: 'row',
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    marginLeft: 5,
    color: '#68C2FF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TabBar;
