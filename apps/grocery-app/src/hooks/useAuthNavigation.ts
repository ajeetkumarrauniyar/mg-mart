import { useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthStore } from '@/stores';

export const useAuthNavigation = () => {
    const navigation = useNavigation();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                // User is authenticated, navigate to main app
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' as never }],
                    })
                );
            } else {
                // User is not authenticated, navigate to auth screen
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Auth' as never }],
                    })
                );
            }
        }
    }, [isAuthenticated, isLoading, navigation]);

    return { isAuthenticated, isLoading };
};

export const useRequireAuth = () => {
    const navigation = useNavigation();
    const { isAuthenticated, isLoading } = useAuthStore();

    const requireAuth = (callback?: () => void) => {
        if (!isAuthenticated && !isLoading) {
            navigation.navigate('Auth' as never);
            return false;
        }

        if (isAuthenticated && callback) {
            callback();
        }

        return isAuthenticated;
    };

    return { requireAuth, isAuthenticated, isLoading };
};