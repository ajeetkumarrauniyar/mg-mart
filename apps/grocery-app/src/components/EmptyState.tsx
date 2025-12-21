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
                <Ionicons name={icon} size={64} color={COLORS.gray[400]} />
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
        paddingHorizontal: SIZES.spacing.xl,
        paddingVertical: SIZES.spacing.xxl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.spacing.lg,
    },
    title: {
        fontSize: SIZES.fontSize.xlarge,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SIZES.spacing.sm,
    },
    description: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SIZES.spacing.xl,
    },
    actionButton: {
        minWidth: 160,
    },
});

export default EmptyState;