import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '@/stores';
import { COLORS, SIZES } from '@/constants';
import { RootStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface AuthGuardProps {
    children: React.ReactNode;
    fallbackMessage?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    fallbackMessage = "Please login to access this feature"
}) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const navigation = useNavigation<NavigationProp>();

    // Show loading while checking auth state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.authPromptContainer}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={64}
                        color={COLORS.textMuted}
                        style={styles.lockIcon}
                    />
                    <Text style={styles.authPromptTitle}>Authentication Required</Text>
                    <Text style={styles.authPromptMessage}>{fallbackMessage}</Text>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Auth')}
                    >
                        <Text style={styles.loginButtonText}>Login / Register</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textMuted,
    },
    authPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingLarge,
    },
    lockIcon: {
        marginBottom: SIZES.marginLarge,
    },
    authPromptTitle: {
        fontSize: SIZES.fontSize.large,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.marginSmall,
        textAlign: 'center',
    },
    authPromptMessage: {
        fontSize: SIZES.fontSize.medium,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SIZES.marginLarge * 2,
        lineHeight: 22,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.paddingLarge * 2,
        paddingVertical: SIZES.paddingSmall,
        borderRadius: SIZES.borderRadius,
        minWidth: 200,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: SIZES.fontSize.medium,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default AuthGuard;