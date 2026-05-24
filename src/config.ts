import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const API_BASE_URL = extra?.apiUrl ?? "http://192.168.100.13:5000";
