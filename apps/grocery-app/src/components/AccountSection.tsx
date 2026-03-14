import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface AccountSectionProps {
    title?: string;
    children: React.ReactNode;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ title, children }) => {
    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    content: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
    },
});
