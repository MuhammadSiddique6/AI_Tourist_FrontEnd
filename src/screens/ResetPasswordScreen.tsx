import type { RouteProp } from "@react-navigation/native";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppLogo } from "../components/AppLogo";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { TextField } from "../components/TextField";
import { accentPalette, colors, radii, shadows } from "../constants/theme";
import { completePasswordReset } from "../services/passwordResetService";
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
  const confirmRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!params.otp_code) {
      Alert.alert("Session expired", "Please verify your code again.", [
        { text: "OK", onPress: () => navigation.navigate("ForgotPassword") },
      ]);
    }
  }, [params.otp_code, navigation]);

  const onSubmit = () => {
    Keyboard.dismiss();
    if (!params.otp_code) {
      navigation.navigate("ForgotPassword");
      return;
    }
    const next = validatePasswordReset(password, confirmPassword);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    completePasswordReset(email, params.otp_code ?? "", password)
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
    <ScreenBackground variant="auth">
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Text style={styles.backText}>← Back to code</Text>
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <AppLogo size="md" />
          </View>
          <View style={styles.hero}>
            <Text style={styles.title}>Create new password</Text>
            <Text style={styles.sub}>Choose a strong password for {email}</Text>
          </View>

          <View style={[styles.card, { borderTopColor: accentPalette.highlight.border }]}>
            <TextField
              label="New password"
              isPassword
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
              blurOnSubmit={false}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={() => confirmRef.current?.focus()}
              error={errors.password}
            />
            <TextField
              ref={confirmRef}
              label="Confirm new password"
              isPassword
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />
            <PrimaryButton
              title="Update password"
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  logoWrap: { alignItems: "center", marginBottom: 16 },
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
    borderTopWidth: 4,
    padding: 22,
    ...shadows.card,
  },
});
