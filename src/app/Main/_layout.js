import { Tabs } from 'expo-router';
import TabBar from '../../components/TabBar';

const Main = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
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