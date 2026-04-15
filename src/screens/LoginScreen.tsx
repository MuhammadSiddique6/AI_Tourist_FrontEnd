import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import {
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
import { useAuth } from "../context/AuthContext";
import { passwordMatches } from "../services/mockCredentialStore";
import { validateLogin } from "../services/validation";
import type { AuthStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AuthStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateLogin>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = () => {
    const next = validateLogin({ email, password });
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (!passwordMatches(email.trim().toLowerCase(), password)) {
      setErrors({ password: "Incorrect password. Reset it if you forgot." });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      login({
        email: email.trim().toLowerCase(),
        displayName: email.trim().split("@")[0] || "Traveler",
      });
      setSubmitting(false);
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, styles.scrollContent]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.kicker}>AI-Based Tourist Companion</Text>
            <Text style={styles.title}>Cultural awareness, in your pocket</Text>
            <Text style={styles.sub}>
              Scan landmarks, hear stories, translate on the go, and explore nearby heritage—offline
              ready when you need it.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <TextField
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <TextField
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                activeOpacity={0.75}
                hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
              >
                <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton title="Sign in" onPress={onSubmit} loading={submitting} style={styles.mt} />
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkMuted}>New here?</Text>
              <Text style={styles.link}> Create an account</Text>
            </TouchableOpacity>
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
  scrollContent: { flexGrow: 1 },
  hero: { marginBottom: 22 },
  kicker: {
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
    fontSize: 13,
  },
  title: { fontSize: 28, fontWeight: "900", color: colors.text, marginBottom: 10 },
  sub: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 22,
    ...shadows.card,
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 8 },
  /** Above the primary button so Android elevation on the button cannot paint over this link. */
  forgotRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
    zIndex: 10,
  },
  forgot: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  mt: { marginTop: 4 },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  linkMuted: { color: colors.textSecondary, fontSize: 15 },
  link: { color: colors.primary, fontWeight: "800", fontSize: 15 },
});
