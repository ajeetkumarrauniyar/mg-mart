import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';
import { COLORS, SIZES } from '@/constants';

interface LoadingProps {
    size?: 'small' | 'large';
    color?: string;
    text?: string;
    overlay?: boolean;
    style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = memo(({
    size = 'large',
    color = COLORS.primary,
    text,
    overlay = false,
    style,
}) => {
    const containerStyle = [
        styles.container,
        overlay && styles.overlay,
        style,
    ];

    return (
        <View style={containerStyle}>
            <ActivityIndicator size={size} color={color} />
            {text && (
                <Text style={[styles.text, { color }]}>
                    {text}
                </Text>
            )}
        </View>
    );
});

Loading.displayName = 'Loading';

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.spacing.lg,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
    },
    text: {
        marginTop: SIZES.spacing.md,
        fontSize: SIZES.fontSize.medium,
        fontWeight: '500',
    },
});

export default Loading;