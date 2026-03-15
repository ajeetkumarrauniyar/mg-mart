import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SIZES } from '../constants';
import { useNotificationStore } from '../stores';
import { NotificationItem, EmptyState } from '../components';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const NotificationsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {notifications.length > 0 ? (
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={styles.readAll}>Mark all read</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationItem
                        notification={item}
                        onPress={() => markAsRead(item.id)}
                    />
                )}
                contentContainerStyle={[
                    styles.list,
                    notifications.length === 0 && { flex: 1, justifyContent: 'center' }
                ]}
                ListEmptyComponent={
                    <EmptyState
                        icon="notifications-off-outline"
                        title="No notifications yet"
                        description="We'll notify you about your orders, special offers and other important updates here."
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            {notifications.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
    },
    readAll: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    list: {
        paddingBottom: 80,
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        gap: 8,
    },
    clearText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
});

export default NotificationsScreen;
