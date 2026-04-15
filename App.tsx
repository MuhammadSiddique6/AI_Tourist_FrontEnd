import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./src/constants/theme";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SavedLandmarksProvider } from "./src/context/SavedLandmarksContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function NavigationRoot() {
  const { isAuthenticated } = useAuth();
  const navKey = useMemo(() => (isAuthenticated ? "session" : "guest"), [isAuthenticated]);

  return (
    <NavigationContainer key={navKey} theme={navTheme}>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SavedLandmarksProvider>
            <NavigationRoot />
          </SavedLandmarksProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
