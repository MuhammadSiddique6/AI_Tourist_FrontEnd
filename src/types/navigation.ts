import type { NavigatorScreenParams } from "@react-navigation/native";
import type { Landmark } from "./landmark";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
  ResetPassword: { email: string; otp_code?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Map: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Detail: { landmark: Landmark };
  Model3DViewer: { landmark: Landmark };
  Landmark3DImage: { landmark: Landmark };
  AdminUsers: undefined;
};
