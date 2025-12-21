import React, { memo } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '@/constants';
import { buttonPress } from '@/utils/haptics';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = memo(({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
}) => {
    const handlePress = () => {
        if (!disabled && !loading) {
            buttonPress(); // Haptic feedback
            onPress();
        }
    };

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            ...styles.button,
            ...styles[`${variant}Button`],
            ...styles[`${size}Button`],
        };

        if (fullWidth) {
            baseStyle.width = '100%';
        }

        if (disabled || loading) {
            baseStyle.opacity = 0.6;
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle => {
        return {
            ...styles.buttonText,
            ...styles[`${variant}Text`],
            ...styles[`${size}Text`],
        };
    };

    const getIconSize = (): number => {
        switch (size) {
            case 'small':
                return SIZES.icon.small;
            case 'large':
                return SIZES.icon.large;
            default:
                return SIZES.icon.medium;
        }
    };

    const getIconColor = (): string => {
        switch (variant) {
            case 'outline':
            case 'ghost':
                return COLORS.primary;
            case 'danger':
                return variant === 'outline' ? COLORS.error : COLORS.white;
            default:
                return COLORS.white;
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
                />
            );
        }

        const iconElement = icon ? (
            <Ionicons
                name={icon}
                size={getIconSize()}
                color={getIconColor()}
                style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
            />
        ) : null;

        const textElement = (
            <Text style={[getTextStyle(), textStyle]}>
                {title}
            </Text>
        );

        return (
            <>
                {iconPosition === 'left' && iconElement}
                {textElement}
                {iconPosition === 'right' && iconElement}
            </>
        );
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {renderContent()}
        </TouchableOpacity>
    );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.borderRadius,
        ...SHADOWS.small,
    },

    // Variants
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    dangerButton: {
        backgroundColor: COLORS.error,
    },

    // Sizes
    smallButton: {
        paddingHorizontal: SIZES.paddingSmall,
        paddingVertical: SIZES.marginSmall,
        minHeight: SIZES.button.small,
    },
    mediumButton: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.paddingSmall,
        minHeight: SIZES.button.medium,
    },
    largeButton: {
        paddingHorizontal: SIZES.paddingLarge,
        paddingVertical: SIZES.padding,
        minHeight: SIZES.button.large,
    },

    // Text styles
    buttonText: {
        fontWeight: SIZES.fontWeight.semibold,
        textAlign: 'center',
    },
    primaryText: {
        color: COLORS.white,
    },
    secondaryText: {
        color: COLORS.white,
    },
    outlineText: {
        color: COLORS.primary,
    },
    ghostText: {
        color: COLORS.primary,
    },
    dangerText: {
        color: COLORS.white,
    },

    // Text sizes
    smallText: {
        fontSize: SIZES.fontSize.small,
    },
    mediumText: {
        fontSize: SIZES.fontSize.regular,
    },
    largeText: {
        fontSize: SIZES.fontSize.large,
    },

    // Icons
    iconLeft: {
        marginRight: SIZES.marginSmall,
    },
    iconRight: {
        marginLeft: SIZES.marginSmall,
    },
});

export default Button;