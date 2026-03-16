export const COLORS = {
  // Primary colors
  primary: "#48bb78",
  primaryLight: "#68d391",
  primaryDark: "#38a169",

  // Secondary colors
  secondary: "#2d3748",
  secondaryLight: "#4a5568",
  secondaryDark: "#1a202c",

  // Background colors
  background: "#f8f9fa",
  backgroundLight: "#ffffff",
  backgroundDark: "#f1f3f4",

  // Text colors
  text: "#2d3748",
  textSecondary: "#4a5568",
  textLight: "#718096",
  textMuted: "#a0aec0",

  // Status colors
  success: "#38b2ac",
  successLight: "#e6fffa",
  error: "#e53e3e",
  errorLight: "#fed7d7",
  warning: "#ed8936",
  warningLight: "#fef5e7",
  info: "#3182ce",
  infoLight: "#ebf8ff",

  // UI colors
  white: "#ffffff",
  black: "#000000",
  border: "#e2e8f0",
  borderLight: "#f0f0f0",
  shadow: "rgba(0, 0, 0, 0.1)",
  overlay: "rgba(0, 0, 0, 0.5)",

  // Card colors
  cardBackground: "#ffffff",
  cardShadow: "rgba(0, 0, 0, 0.08)",
} as const;

export const SIZES = {
  // Spacing
  padding: 20,
  paddingSmall: 12,
  paddingLarge: 24,
  margin: 16,
  marginSmall: 8,
  marginLarge: 24,

  // Border radius
  borderRadius: 8,
  borderRadiusSmall: 4,
  borderRadiusLarge: 12,
  borderRadiusXLarge: 16,

  // Font sizes
  fontSize: {
    tiny: 10,
    small: 12,
    medium: 14,
    regular: 16,
    large: 18,
    xlarge: 20,
    xxlarge: 24,
    huge: 28,
    massive: 32,
  },

  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Icon sizes
  icon: {
    tiny: 12,
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 28,
    huge: 32,
  },

  // Button heights
  button: {
    small: 32,
    medium: 40,
    large: 48,
    xlarge: 56,
  },

  // Screen dimensions helpers
  screen: {
    width: '100%',
    height: '100%',
  },
} as const;

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

export const STORE_CONTACT = {
  PHONE_NUMBER: '+918409652834',
  WHATSAPP_URL: 'https://wa.me/918409652834',
  SUPPORT_MESSAGE: 'Hello MG Mart Support, I need help with my order/account.',
  INQUIRY_MESSAGE: "Hi MG Mart, I'd like to inquire about...",
};
