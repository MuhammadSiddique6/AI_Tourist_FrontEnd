import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { DetailScreen } from "../screens/DetailScreen";
import type { AppStackParamList } from "../types/navigation";
import { AuthStackNavigator } from "./AuthStackNavigator";
import { MainTabNavigator } from "./MainTabNavigator";

const Stack = createStackNavigator<AppStackParamList>();

export function AppNavigator() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthStackNavigator />;
  }

  return (
    <Stack.Navigator
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
    </Stack.Navigator>
  );
}
