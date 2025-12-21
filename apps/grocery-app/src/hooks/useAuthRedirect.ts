import { useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthStore } from '@/stores';

export const useAuthRedirect = () => {
    const navigation = useNavigation();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        // Only handle navigation when not loading and auth state changes
        if (!isLoading) {
            if (isAuthenticated) {
                // User just logged in, navigate to main app
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' as never }],
                    })
                );
            }
            // Don't navigate to Auth when not authenticated, 
            // as the user might already be on Auth screen
        }
    }, [isAuthenticated, isLoading, navigation]);

    return { isAuthenticated, isLoading };
};