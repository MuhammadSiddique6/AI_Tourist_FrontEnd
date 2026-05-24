export const colors = {
  background: "#F4F7F5",
  surface: "#FFFFFF",
  primary: "#2C6E49",
  primaryDark: "#1F4D34",
  primaryMuted: "#D8EDE1",
  accent: "#E8A838",
  accentDark: "#C8871E",
  accentMuted: "#FFF4DC",
  secondary: "#3B82A0",
  secondaryMuted: "#E3F2F8",
  tertiary: "#7C5CBF",
  tertiaryMuted: "#EDE5FA",
  coral: "#E07A5F",
  coralMuted: "#FCE8E3",
  text: "#1A2420",
  textSecondary: "#5C6B66",
  border: "#DDE5E1",
  danger: "#DC2626",
  success: "#10B981",
  successMuted: "#D1F7E5",
  overlay: "rgba(26, 36, 32, 0.5)",
  scannerFrame: "rgba(255, 255, 255, 0.92)",
  tabInactive: "#9CA3AF",
  gradientStart: "#E8F5EC",
  gradientEnd: "#FFF8EB",
  authGradientTop: "#D8EDE1",
  authGradientBottom: "#FFF4DC",
  homeGradientTop: "#E3F2F8",
  profileGradientTop: "#EDE5FA",
  adminGradientTop: "#EDE5FA",
  adminGradientBottom: "#FCE8E3",
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  soft: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const animations = {
  pressOpacity: 0.8,
  mediumDuration: 300,
  quickDuration: 200,
};

/** Accent colors for category chips and action cards */
export const accentPalette = {
  scan: { bg: colors.primaryMuted, fg: colors.primary, border: colors.primary },
  map: { bg: colors.accentMuted, fg: colors.accentDark, border: colors.accent },
  saved: { bg: colors.tertiaryMuted, fg: colors.tertiary, border: colors.tertiary },
  explore: { bg: colors.secondaryMuted, fg: colors.secondary, border: colors.secondary },
  highlight: { bg: colors.coralMuted, fg: colors.coral, border: colors.coral },
};
