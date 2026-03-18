import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SHADOWS } from '../constants';
import { useAuthStore } from '../stores';
import { userService } from '../services';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AuthGuard, ScreenContainer, AppHeader } from '../components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

function EditProfileContent() {
    const navigation = useNavigation<NavigationProp>();
    const { user, setUser } = useAuthStore();

    const nameParts = (user?.name || '').split(' ');
    const [firstName, setFirstName] = useState(nameParts[0] || '');
    const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Error', 'Full name is required');
            return;
        }

        if (phone.trim() && phone.trim().length !== 10) {
            Alert.alert('Error', 'Phone number must be 10 digits');
            return;
        }

        setIsLoading(true);
        try {
            const response = await userService.updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim()
            });
            setUser(response);
            Alert.alert('Success', 'Profile updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Update failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenContainer
            header={<AppHeader title="Edit Profile" />}
            footer={
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveBtn, isLoading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Avatar Preview */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLabel}>
                        {(firstName[0] || '').toUpperCase()}{(lastName[0] || '').toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.changeLabel}>Personal Information</Text>
            </View>

            {/* Inputs */}
            <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Enter first name"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Enter last name"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={[styles.inputWrapper, styles.disabledWrapper]}>
                        <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: COLORS.textMuted }]}
                            value={user?.email}
                            editable={false}
                        />
                    </View>
                    <Text style={styles.helperText}>Email cannot be changed</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
                            placeholder="10 digit mobile number"
                            keyboardType="phone-pad"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        marginBottom: 16,
    },
    avatarLabel: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.white,
    },
    changeLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
    },
    formCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
    },
    disabledWrapper: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    helperText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 4,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    footer: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        paddingBottom: 40,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    saveBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default function EditProfileScreen() {
    return (
        <AuthGuard>
            <EditProfileContent />
        </AuthGuard>
    );
}