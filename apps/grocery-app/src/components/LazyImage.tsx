import React, { useState, useRef, useEffect, memo } from 'react';
import { View, Image, StyleSheet, Dimensions, ImageStyle, ViewStyle } from 'react-native';
import { COLORS } from '@/constants';

interface LazyImageProps {
    source: { uri: string } | number;
    style?: ImageStyle;
    containerStyle?: ViewStyle;
    placeholder?: string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    threshold?: number; // Distance from viewport to start loading
    onLoad?: () => void;
    onError?: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export const LazyImage: React.FC<LazyImageProps> = memo(({
    source,
    style,
    containerStyle,
    placeholder = 'https://via.placeholder.com/150',
    resizeMode = 'cover',
    threshold = screenHeight * 0.5, // Load when within 50% of screen height
    onLoad,
    onError,
}) => {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const viewRef = useRef<View>(null);

    useEffect(() => {
        const checkVisibility = () => {
            if (viewRef.current && !shouldLoad) {
                viewRef.current.measure((x, y, width, height, pageX, pageY) => {
                    const isVisible = pageY < screenHeight + threshold && pageY + height > -threshold;
                    if (isVisible) {
                        setShouldLoad(true);
                    }
                });
            }
        };

        // Check visibility immediately
        const timer = setTimeout(checkVisibility, 100);

        return () => clearTimeout(timer);
    }, [shouldLoad, threshold]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    const imageSource = hasError
        ? { uri: placeholder }
        : typeof source === 'number'
            ? source
            : source;

    return (
        <View ref={viewRef} style={[styles.container, containerStyle]}>
            {shouldLoad ? (
                <Image
                    source={imageSource}
                    style={[styles.image, style]}
                    resizeMode={resizeMode}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            ) : (
                <View style={[styles.placeholder, style]} />
            )}

            {shouldLoad && !isLoaded && !hasError && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.shimmer} />
                </View>
            )}
        </View>
    );
});

LazyImage.displayName = 'LazyImage';

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        backgroundColor: '#f0f0f0',
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shimmer: {
        width: '60%',
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
    },
});

export default LazyImage;