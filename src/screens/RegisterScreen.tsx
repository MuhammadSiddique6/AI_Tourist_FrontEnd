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
import { validateRegister } from "../services/validation";
import type { AuthStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AuthStackParamList, "Register">;

const KEYBOARD_OFFSET = Platform.OS === "ios" ? 8 : 0;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateRegister>>({});
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const onSubmit = () => {
    Keyboard.dismiss();
    const next = validateRegister({ displayName, email, password });
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    api.auth
      .register(displayName.trim(), email.trim().toLowerCase(), password)
      .then(() => api.auth.login(email.trim().toLowerCase(), password))
      .then((res) => {
        const token = res.token ?? null;
        const backendUser = res.user ?? null;
        const user = backendUser
          ? {
              id: backendUser.id != null ? String(backendUser.id) : undefined,
              email: backendUser.email,
              displayName: backendUser.name ?? displayName.trim(),
              role: backendUser.role,
            }
          : {
              email: email.trim().toLowerCase(),
              displayName: displayName.trim(),
            };
        login(user, token);
      })
      .catch((err) => {
        const msg = err?.message || "Registration failed";
        setErrors({ password: msg });
      })
      .finally(() => setSubmitting(false));
  };

  const clearFieldError = (field: keyof ReturnType<typeof validateRegister>) => {
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>← Back to sign in</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.title}>Create your traveler profile</Text>
            <Text style={styles.sub}>
              Save favorite sites and keep scans organized.
            </Text>
          </View>

          <View style={styles.card}>
            <TextField
              label="Display name"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              blurOnSubmit={false}
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                clearFieldError("displayName");
              }}
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.displayName}
            />
            <TextField
              ref={emailRef}
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
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError("password");
              }}
              error={errors.password}
            />
            <PrimaryButton
              title="Register"
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.mt}
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
  scroll: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 40,
  },
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
  mt: { marginTop: 8 },
});
