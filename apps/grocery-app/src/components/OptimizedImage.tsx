import React, { useState, useRef, memo, useEffect } from "react";
import {
  Image,
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  ImageResizeMode,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";

interface OptimizedImageProps {
  source: { uri?: string } | number;
  style?: ViewStyle; // applied to the container View
  containerStyle?: ViewStyle;
  resizeMode?: ImageResizeMode;
  onLoad?: () => void;
  onError?: () => void;
}

const ShimmerPlaceholder: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  return (
    <Animated.View style={[styles.shimmer, style, { opacity }]} />
  );
};

const ErrorPlaceholder: React.FC = () => (
  <View style={styles.errorContainer}>
    <Ionicons name="leaf-outline" size={28} color={COLORS.primary} />
  </View>
);

const OptimizedImage: React.FC<OptimizedImageProps> = memo(
  ({
    source,
    style,
    containerStyle,
    resizeMode = "cover",
    onLoad,
    onError,
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };

    // Determine if we have a valid URI
    const uri =
      typeof source === "object" ? source?.uri?.trim() : undefined;
    const hasValidUri = Boolean(uri);

    // If no URI at all, skip load spinner and just show error state
    const showError = hasError || (!hasValidUri && typeof source === "object");
    const showShimmer = isLoading && hasValidUri && !hasError;

    return (
      <View style={[styles.container, style, containerStyle]}>
        {/* Only render the Image when we have a real URI */}
        {hasValidUri && !hasError && (
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode={resizeMode}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}

        {/* Shimmer while image loads */}
        {showShimmer && <ShimmerPlaceholder style={StyleSheet.absoluteFillObject} />}

        {/* Branded error / no-image fallback */}
        {showError && <ErrorPlaceholder />}
      </View>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#F0F4F0",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#D6E4D6",
    borderRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F0",
    width: "100%",
    height: "100%",
  },
});

export default OptimizedImage;
