import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, MIN_ORDER_VALUE } from "../constants";

interface MinOrderBannerProps {
  currentTotal: number;
  qualifyingAmount: number;
}

/**
 * Shows progress toward the ₹500 minimum order value.
 *
 * States:
 *   Below minimum → amber progress bar with "Add ₹X more to place order"
 *   At minimum     → green bar, "You're ready to order!"
 *   Above minimum  → green bar (compact, collapsible)
 *
 */
export const MinOrderBanner: React.FC<MinOrderBannerProps> = ({
  currentTotal,
  qualifyingAmount,
}) => {
  const remaining = Math.max(0, MIN_ORDER_VALUE - qualifyingAmount);
  const progress = Math.min(1, qualifyingAmount / MIN_ORDER_VALUE);
  const isMet = remaining === 0;

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false, // animating width — must be false
    }).start();
  }, [progress, progressAnim]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, isMet && styles.containerMet]}>
      {/* Icon + message row */}
      <View style={styles.row}>
        <Ionicons
          name={isMet ? "checkmark-circle" : "cart-outline"}
          size={20}
          color={isMet ? COLORS.primary : COLORS.warning}
        />
        <Text style={[styles.message, isMet && styles.messageMet]}>
          {isMet
            ? "Ready to order! ✓"
            : `Add ₹${remaining.toFixed(0)} more to place order`}
        </Text>
        <Text style={styles.fraction}>
          ₹{qualifyingAmount.toFixed(0)}&nbsp;/&nbsp;₹{MIN_ORDER_VALUE}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: barWidth }, isMet && styles.fillMet]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning,
    gap: 8,
  },
  containerMet: {
    backgroundColor: COLORS.successLight,
    borderBottomColor: COLORS.success,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  message: {
    flex: 1,
    fontSize: SIZES.fontSize.small,
    fontWeight: SIZES.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  messageMet: {
    color: COLORS.primaryDark,
  },

  fraction: {
    fontSize: SIZES.fontSize.tiny,
    fontWeight: SIZES.fontWeight.medium,
    color: COLORS.textSecondary,
  },

  // Progress track
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warningLight,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  fillMet: {
    backgroundColor: COLORS.primary,
  },
});

export default MinOrderBanner;
