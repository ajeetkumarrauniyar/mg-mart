import React, { useState, memo } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, ImageStyle, ViewStyle } from 'react-native';
import { COLORS } from '@/constants';

interface OptimizedImageProps {
    source: { uri: string } | number;
    style?: ImageStyle;
    containerStyle?: ViewStyle;
    placeholder?: string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    onLoad?: () => void;
    onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
    source,
    style,
    containerStyle,
    placeholder = 'https://via.placeholder.com/150',
    resizeMode = 'cover',
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

    const imageSource = hasError
        ? { uri: placeholder }
        : typeof source === 'number'
            ? source
            : source;

    return (
        <View style={[styles.container, containerStyle]}>
            <Image
                source={imageSource}
                style={[styles.image, style]}
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
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
    },
});

export default OptimizedImage;