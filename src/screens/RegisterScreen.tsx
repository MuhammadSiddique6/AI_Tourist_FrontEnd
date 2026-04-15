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
import { savePasswordForEmail } from "../services/mockCredentialStore";
import { validateRegister } from "../services/validation";
import type { AuthStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AuthStackParamList, "Register">;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateRegister>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = () => {
    const next = validateRegister({ displayName, email, password });
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      const key = email.trim().toLowerCase();
      savePasswordForEmail(key, password);
      login({
        email: key,
        displayName: displayName.trim(),
      });
      setSubmitting(false);
    }, 450);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back to sign in</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.title}>Create your traveler profile</Text>
            <Text style={styles.sub}>Save favorite sites and keep scans organized.</Text>
          </View>

          <View style={styles.card}>
            <TextField
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              error={errors.displayName}
            />
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
            <PrimaryButton title="Register" onPress={onSubmit} loading={submitting} style={styles.mt} />
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
  title: { fontSize: 24, fontWeight: "900", color: colors.text, marginBottom: 8 },
  sub: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 22,
    ...shadows.card,
  },
  mt: { marginTop: 8 },
});
