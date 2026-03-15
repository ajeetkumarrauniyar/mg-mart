import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { Notification } from '../stores/notificationStore';

interface NotificationItemProps {
    notification: Notification;
    onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'order': return 'cube-outline';
            case 'promo': return 'pricetag-outline';
            default: return 'notifications-outline';
        }
    };

    const getIconColor = () => {
        switch (notification.type) {
            case 'order': return '#48BB78';
            case 'promo': return '#ED8936';
            default: return '#4299E1';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <TouchableOpacity
            style={[styles.container, !notification.isRead && styles.unread]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
                <Ionicons name={getIcon() as any} size={24} color={getIconColor()} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, !notification.isRead && styles.unreadText]}>
                        {notification.title}
                    </Text>
                    <Text style={styles.time}>{formatTimestamp(notification.timestamp)}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {notification.message}
                </Text>
            </View>

            {!notification.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'center',
    },
    unread: {
        backgroundColor: '#F8FAFC',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
    },
    unreadText: {
        fontWeight: 'bold',
    },
    time: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    message: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: 12,
    },
});
