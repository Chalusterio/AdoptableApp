import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";
import PetProvider from "../../context/PetContext";
import UserProvider from "../../context/UserContext";

const Main = () => {
  return (
    <UserProvider>
      <PetProvider>
        <Tabs tabBar={(props) => <TabBar {...props} />}>
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
      </PetProvider>
    </UserProvider>
  );
};

export default Main;
