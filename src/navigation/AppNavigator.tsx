import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { DetailScreen } from "../screens/DetailScreen";
import { AdminUsersScreen } from "../screens/AdminUsersScreen";
import { Landmark3DImageScreen } from "../screens/Landmark3DImageScreen";
import { Model3DViewerScreen } from "../screens/Model3DViewerScreen";
import { isAdminUser } from "../types/auth";
import type { AppStackParamList } from "../types/navigation";
import { AuthStackNavigator } from "./AuthStackNavigator";
import { MainTabNavigator } from "./MainTabNavigator";

const Stack = createStackNavigator<AppStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAdminUser(user);

  if (!isAuthenticated) {
    return <AuthStackNavigator />;
  }

  return (
    <Stack.Navigator
      key={isAdmin ? "admin-session" : "user-session"}
      initialRouteName={isAdmin ? "AdminUsers" : "MainTabs"}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          presentation: "card",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Model3DViewer"
        component={Model3DViewerScreen}
        options={{
          presentation: "card",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Landmark3DImage"
        component={Landmark3DImageScreen}
        options={{
          presentation: "card",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          presentation: "card",
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
