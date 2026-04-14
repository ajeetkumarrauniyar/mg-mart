import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, getDeliveryStatusMessage } from "../constants";

interface DeliveryStatusBannerProps {
  /** Override the current time — useful for testing */
  nowOverride?: Date;
  /** When true, shows a compact 1-line version (for home screen header) */
  compact?: boolean;
}

/**
 * Shows delivery availability at a glance.
 *
 * Green pill  → delivery available now
 * Amber banner → peak hours, shows next available time
 *
 * Updates every 60 seconds automatically so the message stays accurate.
 */
export const DeliveryStatusBanner: React.FC<DeliveryStatusBannerProps> = ({
  nowOverride,
  compact = false,
}) => {
  const [status, setStatus] = useState(() =>
    getDeliveryStatusMessage(nowOverride ?? new Date()),
  );
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Refresh every minute
  useEffect(() => {
    const update = () => {
      setStatus(getDeliveryStatusMessage(nowOverride ?? new Date()));
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [nowOverride]);

  // Fade in once
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (compact) {
    // Compact pill — for embedding in the location header row
    return (
      <Animated.View
        style={[
          styles.compactPill,
          status.available ? styles.pillAvailable : styles.pillUnavailable,
          { opacity: fadeAnim },
        ]}
      >
        <View
          style={[
            styles.dot,
            status.available ? styles.dotGreen : styles.dotAmber,
          ]}
        />
        <Text
          style={[
            styles.compactText,
            status.available ? styles.textGreen : styles.textAmber,
          ]}
          numberOfLines={1}
        >
          {status.available ? "Delivery open" : "Busy now"}
        </Text>
      </Animated.View>
    );
  }

  // Full banner — shown when delivery is unavailable
  if (status.available) {
    // Don't show anything when delivery is open — keep the UI uncluttered
    return null;
  }

  return (
    <Animated.View style={[styles.banner, { opacity: fadeAnim }]}>
      <View style={styles.bannerIcon}>
        <Ionicons name="time-outline" size={20} color={COLORS.warning} />
      </View>
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>Delivery not available right now</Text>
        <Text style={styles.bannerBody}>{status.message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ── Compact pill ───────────────────────────────────────────────────────────
  compactPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  pillAvailable: {
    backgroundColor: "#F0FFF4",
  },
  pillUnavailable: {
    backgroundColor: "#FFFBEB",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: COLORS.primary,
  },
  dotAmber: {
    backgroundColor: COLORS.warning,
  },
  compactText: {
    fontSize: SIZES.fontSize.tiny,
    fontWeight: SIZES.fontWeight.semibold,
  },
  textGreen: {
    color: COLORS.primaryDark,
  },
  textAmber: {
    color: COLORS.warning,
  },

  // ── Full banner (unavailable state) ───────────────────────────────────────
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    gap: 12,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: SIZES.fontSize.small,
    fontWeight: SIZES.fontWeight.bold,
    color: "#92400E",
    marginBottom: 2,
  },
  bannerBody: {
    fontSize: SIZES.fontSize.tiny,
    color: "#B45309",
    lineHeight: 18,
  },
});

export default DeliveryStatusBanner;
