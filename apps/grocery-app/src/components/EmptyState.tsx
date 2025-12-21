import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '@/constants';
import Button from './Button';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    actionTitle?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = memo(({
    icon = 'information-circle-outline',
    title,
    description,
    actionTitle,
    onAction,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={64} color={COLORS.textMuted} />
            </View>

            <Text style={styles.title}>{title}</Text>

            {description && (
                <Text style={styles.description}>{description}</Text>
            )}

            {actionTitle && onAction && (
                <Button
                    title={actionTitle}
                    onPress={onAction}
                    variant="primary"
                    style={styles.actionButton}
                />
            )}
        </View>
    );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingLarge,
        paddingVertical: SIZES.paddingLarge,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.marginLarge,
    },
    title: {
        fontSize: SIZES.fontSize.xlarge,
        fontWeight: SIZES.fontWeight.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SIZES.marginSmall,
    },
    description: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SIZES.marginLarge,
    },
    actionButton: {
        minWidth: 160,
    },
});

export default EmptyState;