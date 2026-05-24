import type { RouteProp } from "@react-navigation/native";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { colors, radii, shadows } from "../constants/theme";
import api from "../services/api";
import { validatePasswordReset } from "../services/validation";
import type { AuthStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AuthStackParamList, "ResetPassword">;
type R = RouteProp<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { email } = params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<
    ReturnType<typeof validatePasswordReset>
  >({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!params.otp_code) {
      Alert.alert("Session expired", "Please verify your code again.", [
        { text: "OK", onPress: () => navigation.navigate("ForgotPassword") },
      ]);
    }
  }, [params.otp_code, navigation]);

  const onSubmit = () => {
    if (!params.otp_code) {
      navigation.navigate("ForgotPassword");
      return;
    }
    const next = validatePasswordReset(password, confirmPassword);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    api.auth
      .resetPassword(email, params.otp_code ?? "", password)
      .then(() => {
        setSubmitting(false);
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
        );
        Alert.alert(
          "Password updated",
          "You can now sign in with your new password.",
        );
      })
      .catch((err) => {
        const msg = err?.message || "Unable to reset password";
        Alert.alert("Error", msg);
        setSubmitting(false);
      });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Text style={styles.backText}>← Back to code</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.title}>Create new password</Text>
            <Text style={styles.sub}>Choose a strong password for {email}</Text>
          </View>

          <View style={styles.card}>
            <TextField
              label="New password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
            <TextField
              label="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />
            <PrimaryButton
              title="Update password"
              onPress={onSubmit}
              loading={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 40 },
  back: { marginBottom: 16 },
  backText: { color: colors.primary, fontWeight: "700", fontSize: 15 },
  hero: { marginBottom: 18 },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 8,
  },
  sub: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 22,
    ...shadows.card,
  },
});
