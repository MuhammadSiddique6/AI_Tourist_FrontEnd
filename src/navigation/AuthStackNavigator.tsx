import { createStackNavigator } from "@react-navigation/stack";
import { colors } from "../constants/theme";
import type { AuthStackParamList } from "../types/navigation";
import {
  ForgotPasswordScreen,
  LoginScreen,
  OtpVerificationScreen,
  RegisterScreen,
  ResetPasswordScreen,
} from "../screens/authScreens";

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
