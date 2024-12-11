import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const TabBar = ({ state, descriptors, navigation }) => {
  const activeColor = '#68C2FF';
  const inactiveColor = '#FFF';

  const [fontsLoaded] = useFonts({
    Lilita: require('../assets/fonts/LilitaOne-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null; 
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
              {isFocused && route.name !== 'List' && (
                <Text
                  style={[
                    styles.activeText,
                    { fontFamily: 'Lilita', fontSize: route.name === 'Notification' ? 15 : 15 },
                  ]}
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
    alignSelf: 'center', // Prevents stretching
  },
  tabbarItemActive: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingVertical: 8,
    flexDirection: 'row',
    alignSelf: 'center', // Hugs the content
    paddingHorizontal: 10, // Minimal padding to hug content
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
});

export default TabBar;