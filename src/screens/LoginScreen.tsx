import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useRef, useState } from "react";
import {
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
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { colors, radii, shadows } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { validateLogin } from "../services/validation";
import type { AuthStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AuthStackParamList, "Login">;

const KEYBOARD_OFFSET = Platform.OS === "ios" ? 8 : 0;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateLogin>>({});
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const onSubmit = () => {
    Keyboard.dismiss();
    const next = validateLogin({ email, password });
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    api.auth
      .login(email.trim().toLowerCase(), password)
      .then((res) => {
        const token = res.token ?? null;
        const backendUser = res.user ?? null;
        const user = backendUser
          ? {
              id: backendUser.id != null ? String(backendUser.id) : undefined,
              email: backendUser.email,
              displayName: backendUser.name ?? backendUser.displayName,
              role: backendUser.role,
            }
          : {
              email: email.trim().toLowerCase(),
              displayName: email.split("@")[0],
            };
        login(user, token);
      })
      .catch((err) => {
        const msg = err?.message || "Login failed";
        setErrors({ password: msg });
      })
      .finally(() => setSubmitting(false));
  };

  const clearFieldError = (field: keyof ReturnType<typeof validateLogin>) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={KEYBOARD_OFFSET}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.kicker}>AI-Based Tourist Companion</Text>
            <Text style={styles.title}>Cultural awareness, in your pocket</Text>
            <Text style={styles.sub}>
              Scan landmarks, hear stories, translate on the go, and explore
              nearby heritage—offline ready when you need it.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <TextField
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearFieldError("email");
              }}
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.email}
            />
            <TextField
              ref={passwordRef}
              label="Password"
              isPassword
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError("password");
              }}
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
            <PrimaryButton
              title="Sign in"
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.mt}
            />
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.8}
            >
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
  scroll: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 40,
    justifyContent: "center",
  },
  hero: { marginBottom: 22 },
  kicker: {
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 10,
  },
  sub: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 22,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  forgotRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
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
