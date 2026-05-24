import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
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
import { AppLogo } from "../components/AppLogo";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { TextField } from "../components/TextField";
import { accentPalette, colors, radii, shadows } from "../constants/theme";
import {
  isPasswordResetMockActive,
  resendPasswordResetOtp,
  verifyOtpForReset,
} from "../services/passwordResetService";
import { validateOtpInput } from "../services/validation";
import type { AuthStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AuthStackParamList, "OtpVerification">;
type R = RouteProp<AuthStackParamList, "OtpVerification">;

export function OtpVerificationScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { email } = params;
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateOtpInput>>({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const onVerify = () => {
    const next = validateOtpInput(otp);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!verifyOtpForReset(email, otp)) {
      setErrors({ otp: "Invalid or expired code. Try resend or request a new one." });
      return;
    }

    navigation.navigate("ResetPassword", { email, otp_code: otp });
  };

  const onResend = async () => {
    setResendLoading(true);
    try {
      const { code } = await resendPasswordResetOtp(email);
      const mockHint = isPasswordResetMockActive()
        ? "\n\n(Offline demo — code shown below.)"
        : "";
      Alert.alert(
        "Code sent again",
        code
          ? `A new 6-digit code was sent to:\n${email}${mockHint}\n\n—\nYour code is ${code}.`
          : `A new 6-digit code was sent to:\n${email}`,
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ScreenBackground variant="auth">
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
            <Text style={styles.backText}>← Use a different email</Text>
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <AppLogo size="md" />
          </View>
          <View style={styles.hero}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.sub}>
              We emailed a 6-digit verification code to:
            </Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.subMuted}>
              Enter the code from that message below. If you do not see it, wait
              a minute or check spam and promotions.
            </Text>
          </View>

          <View style={[styles.card, { borderTopColor: accentPalette.saved.border }]}>
            <TextField
              label="6-digit code from email"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
              error={errors.otp}
            />
            <PrimaryButton
              title="Verify and continue"
              onPress={onVerify}
              loading={loading}
            />
            <TouchableOpacity
              style={styles.resend}
              onPress={onResend}
              disabled={resendLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.resendText}>
                {resendLoading ? "Sending…" : "Resend code to email"}
              </Text>
            </TouchableOpacity>
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
    marginBottom: 10,
  },
  sub: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  email: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginTop: 6,
    marginBottom: 10,
  },
  subMuted: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderTopWidth: 4,
    padding: 22,
    ...shadows.card,
  },
  resend: { marginTop: 18, alignItems: "center" },
  resendText: { fontSize: 15, fontWeight: "800", color: colors.primary },
});
