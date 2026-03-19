import React, { useState, memo } from "react";
import {
  Image,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { COLORS, PLACEHOLDER_URI } from "@/constants";

interface OptimizedImageProps {
  source: { uri?: string } | number;
  style?: ViewStyle; // applied to the container View
  containerStyle?: ViewStyle;
  placeholder?: string;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(
  ({
    source,
    style,
    containerStyle,
    placeholder = PLACEHOLDER_URI,
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

    // Determine what to render
    const getImageSource = () => {
      if (hasError) return { uri: placeholder };
      if (typeof source === "number") return source; // local require()
      // Only render a URI if it's non-empty
      const uri = source?.uri?.trim();
      if (!uri) {
        // Skip loading state for missing URIs
        if (isLoading) setIsLoading(false);
        return { uri: placeholder };
      }
      return { uri };
    };

    return (
      // style goes to the container so dimensions are set correctly
      <View style={[styles.container, style, containerStyle]}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(241, 245, 249, 0.85)",
  },
});

export default OptimizedImage;
