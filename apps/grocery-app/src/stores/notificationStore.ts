import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type: 'order' | 'promo' | 'system';
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [
                {
                    id: '1',
                    title: 'Order Delivered! 📦',
                    message: 'Your order #MG123456 has been delivered successfully. Hope you enjoy your groceries!',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    isRead: false,
                    type: 'order',
                },
                {
                    id: '2',
                    title: 'Big Sale is Live! 🍎',
                    message: 'Get up to 50% off on fresh fruits and vegetables this weekend. Shop now!',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    isRead: true,
                    type: 'promo',
                },
                {
                    id: '3',
                    title: 'Welcome to MG Mart! 🎉',
                    message: 'Thank you for joining us. We are excited to serve you the best groceries in town.',
                    timestamp: new Date(Date.now() - 172800000).toISOString(),
                    isRead: true,
                    type: 'system',
                },
            ],
            addNotification: (notification) => set((state) => ({
                notifications: [
                    { ...notification, id: Math.random().toString(), isRead: false },
                    ...state.notifications,
                ]
            })),
            markAsRead: (id) => set((state) => ({
                notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
            })),
            markAllAsRead: () => set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true }))
            })),
            clearAll: () => set({ notifications: [] }),
        }),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
