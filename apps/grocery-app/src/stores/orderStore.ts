import { create } from 'zustand';
import { Order } from '@mg-mart/types';
import { orderService } from '../services';

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    fetchOrders: () => Promise<void>;
    getOrderById: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    isLoading: false,
    error: null,

    fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.getOrders();
            set({ orders: response.orders, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch orders',
                isLoading: false
            });
        }
    },

    getOrderById: (orderId: string) => {
        return get().orders.find(o => o.orderId === orderId);
    },
}));
