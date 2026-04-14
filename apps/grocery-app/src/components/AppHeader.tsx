import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants";

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string | undefined;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightAction,
  subtitle,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.container}>
      <View style={styles.sideSlot}>
        {showBackButton && canGoBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons
              name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
              size={SIZES.icon.large}
              color={COLORS.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centre}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.sideSlot}>{rightAction ?? null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  sideSlot: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: SIZES.fontSize.large,
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
    letterSpacing: 0.1,
  },

  subtitle: {
    fontSize: SIZES.fontSize.small, // 14 px
    fontWeight: SIZES.fontWeight.regular,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});

export default AppHeader;
