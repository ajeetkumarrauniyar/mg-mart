import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

interface AppHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBackButton = true,
    onBackPress,
    rightAction,
}) => {
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                {showBackButton && navigation.canGoBack() && (
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                )}
            </View>
            
            <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                {rightAction}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    leftContainer: {
        minWidth: 40,
        alignItems: 'flex-start',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    rightContainer: {
        minWidth: 40,
        alignItems: 'flex-end',
    },
});

export default AppHeader;
