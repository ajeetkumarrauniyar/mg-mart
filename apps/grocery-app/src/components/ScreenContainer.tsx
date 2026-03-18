import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { COLORS } from "../constants";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  withPadding?: boolean;
  bottomTabOffset?: boolean;
  contentContainerStyle?: ViewStyle;
}

/**
 * A standard layout wrapper for all screens.
 * Handles Safe Area Insets, Keyboard avoiding, and consistent spacing.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  scrollable = true,
  header,
  footer,
  withPadding = false,
  bottomTabOffset = false,
  contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    withPadding && styles.withPadding,
    style,
  ];

  const renderContent = () => {
    // Use 80 as a safe default for tab bar if offset is needed
    const offsetPadding = bottomTabOffset ? 80 + insets.bottom : 0;

    const combinedContentStyle = [
      styles.content,
      { paddingBottom: offsetPadding },
      contentContainerStyle,
    ];

    if (scrollable) {
      return (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={combinedContentStyle}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return <View style={[styles.flex, contentContainerStyle]}>{children}</View>;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {header}
        <View style={containerStyle}>{renderContent()}</View>
        {footer && (
          <View
            style={{
              paddingBottom: bottomTabOffset
                ? insets.bottom + 65
                : insets.bottom,
            }}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  content: {
    flexGrow: 1,
  },
  withPadding: {
    paddingHorizontal: 16,
  },
});

export default ScreenContainer;
