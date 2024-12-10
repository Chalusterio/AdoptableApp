import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";
import PetProvider from "../../context/PetContext";
import UserProvider from "../../context/UserContext";
import SideBar from "../../components/SideBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Main = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <PetProvider>
          <SideBar>
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
          </SideBar>
        </PetProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
};

export default Main;
