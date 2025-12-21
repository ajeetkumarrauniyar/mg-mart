import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores';
import { Button, Loading } from '@/components';
import { useNavigation } from '@react-navigation/native';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
    showLoginPrompt?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    fallback,
    redirectTo,
    showLoginPrompt = true,
}) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const navigation = useNavigation();

    // Show loading while checking auth state
    if (isLoading) {
        return <Loading />;
    }

    // If user is authenticated, render children
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // If custom fallback is provided, use it
    if (fallback) {
        return <>{fallback}</>;
    }

    // Default login prompt
    if (showLoginPrompt) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Login Required</Text>
                    <Text style={styles.message}>
                        Please log in to access this feature
                    </Text>
                    <Button
                        title="Go to Login"
                        onPress={() => navigation.navigate('Auth' as never)}
                        style={styles.button}
                    />
                </View>
            </View>
        );
    }

    // Return null if no fallback and no login prompt
    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7fafc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        maxWidth: 300,
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#4a5568',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        width: '100%',
    },
});