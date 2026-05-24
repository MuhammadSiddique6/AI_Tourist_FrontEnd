import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
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
import { validateForgotEmail } from "../services/validation";
import type { AuthStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateForgotEmail>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const onSendCode = async () => {
    const next = validateForgotEmail(email);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const key = email.trim().toLowerCase();
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(key);
      // Backend may return code for demo; in production it won't
      const code = (res && (res.code || res.otp)) ?? null;
      Alert.alert(
        "Check your email",
        code
          ? `A 6-digit verification code was sent to:\n${key}\n\n—\nDemo: Your code is ${code}.`
          : `A 6-digit verification code was sent to:\n${key}`,
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.navigate("OtpVerification", { email: key }),
          },
        ],
      );
    } catch (err: any) {
      const msg = err?.message || "Failed to send code";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.backText}>← Back to sign in</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.title}>Forgot password</Text>
            <Text style={styles.sub}>
              Enter the email address for your account. We will email you a
              one-time code. After you verify it, you can set a new password.
            </Text>
          </View>

          <View style={styles.card}>
            <TextField
              label="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              placeholder="you@example.com"
            />
            <PrimaryButton
              title="Send code to email"
              onPress={onSendCode}
              loading={loading}
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
