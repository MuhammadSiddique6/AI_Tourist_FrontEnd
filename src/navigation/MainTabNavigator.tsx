import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../constants/theme";
import { HomeScreen } from "../screens/HomeScreen";
import { MapScreen } from "../screens/MapScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ScanScreen } from "../screens/ScanScreen";
import type { MainTabParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ACTIVE_COLORS: Record<keyof MainTabParamList, string> = {
  Home: colors.primary,
  Scan: colors.accentDark,
  Map: colors.secondary,
  Profile: colors.tertiary,
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:
          TAB_ACTIVE_COLORS[route.name as keyof MainTabParamList],
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          shadowColor: colors.primaryDark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => {
          const map: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: "home",
            Scan: "camera",
            Map: "map",
            Profile: "person-circle",
          };
          const name = map[route.name as keyof MainTabParamList];
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: "Home" }} component={HomeScreen} />
      <Tab.Screen name="Scan" options={{ title: "Scan" }} component={ScanScreen} />
      <Tab.Screen name="Map" options={{ title: "Map" }} component={MapScreen} />
      <Tab.Screen name="Profile" options={{ title: "Profile" }} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
