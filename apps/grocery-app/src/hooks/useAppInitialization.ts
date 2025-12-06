import { useEffect, useState } from 'react';
import { useAuthStore, useCartStore, useProductStore } from '@/stores';
import { isFeatureEnabled } from '../config';

export const useAppInitialization = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    const authStore = useAuthStore();
    const cartStore = useCartStore();
    const productStore = useProductStore();

    useEffect(() => {
        const initializeApp = async () => {
            try {
                if (isFeatureEnabled('ENABLE_DEBUG_MODE')) {
                    console.log('🚀 Initializing MG-MART App...');
                }

                // Initialize auth state from storage
                await authStore.loadStoredAuth();

                // Load persisted cart data and recalculate totals
                cartStore.loadPersistedCart();

                // If user is authenticated, sync cart with server
                if (authStore.isAuthenticated) {
                    try {
                        await cartStore.syncWithServer();
                    } catch (error) {
                        console.warn('Failed to sync cart with server:', error);
                        // Don't fail initialization if cart sync fails
                    }
                }

                // Load categories for product filtering


                // Load featured products for home screen
                setIsInitialized(true);

                if (isFeatureEnabled('ENABLE_DEBUG_MODE')) {
                    console.log('✅ App initialization completed successfully');
                }
            } catch (error: any) {
                console.error('❌ App initialization failed:', error);
                setInitError(error.message || 'Failed to initialize app');
                setIsInitialized(true); // Still mark as initialized to prevent infinite loading
            }
        };

        initializeApp();
    }, []);

    return {
        isInitialized,
        initError,
    };
};