import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants';
import { useAuthStore } from '../stores';
import { userService } from '../services';
import { AuthGuard } from '../components';

function EditProfileContent() {
    const navigation = useNavigation();
    const { user, setUser } = useAuthStore();

    // Split existing name into firstName and lastName
    const nameParts = (user?.name || '').split(' ');
    const [firstName, setFirstName] = useState(nameParts[0] || '');
    const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        // Validation
        if (!firstName.trim()) {
            Alert.alert('Error', 'Please enter your first name');
            return;
        }
        if (!lastName.trim()) {
            Alert.alert('Error', 'Please enter your last name');
            return;
        }

        // Phone number validation
        if (phone.trim() && (phone.trim().length < 10 || phone.trim().length > 10)) {
            Alert.alert('Error', 'Phone number must be exactly 10 digits');
            return;
        }

        setIsLoading(true);

        try {
            const updateData: any = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                // Don't include email since it's not editable
            };

            if (phone.trim()) {
                updateData.phone = phone.trim();
            }

            console.log('🔄 Updating profile with data:', updateData);
            const response = await userService.updateProfile(updateData);
            console.log('✅ Profile update response:', response);
            console.log('✅ Response type:', typeof response);
            console.log('✅ Response keys:', Object.keys(response || {}));

            // Update local auth store with the updated user data
            setUser(response);
            console.log('✅ Auth store updated with new user data');

            Alert.alert('Success', 'Profile updated successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('❌ Profile update failed:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {(firstName[0] || '') + (lastName[0] || '') || 'U'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.changePhotoButton}>
                        <Ionicons name="camera" size={16} color={COLORS.primary} />
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Name Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.inputLabel}>First Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter first name"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholderTextColor="#a0aec0"
                                editable={!isLoading}
                                autoCapitalize="words"
                            />
                        </View>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.inputLabel}>Last Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter last name"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholderTextColor="#a0aec0"
                                editable={!isLoading}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#a0aec0"
                            editable={false}
                        />
                        <Text style={styles.disabledText}>Email cannot be changed</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number (10 digits)"
                            value={phone}
                            onChangeText={(text) => {
                                // Only allow numbers and limit to 10 characters
                                const numericText = text.replace(/[^0-9]/g, '');
                                if (numericText.length <= 10) {
                                    setPhone(numericText);
                                }
                            }}
                            keyboardType="phone-pad"
                            placeholderTextColor="#a0aec0"
                            editable={!isLoading}
                            maxLength={10}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: COLORS.white,
        marginBottom: 16,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.white,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: '#f0fdf4',
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 6,
    },
    form: {
        backgroundColor: COLORS.white,
        padding: SIZES.padding,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    disabledInput: {
        backgroundColor: '#f7fafc',
        color: '#a0aec0',
        borderColor: '#e2e8f0',
    },
    disabledText: {
        fontSize: 12,
        color: '#718096',
        marginTop: 4,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
export default function EditProfileScreen() {
    return (
        <AuthGuard fallbackMessage="Please login to edit your profile">
            <EditProfileContent />
        </AuthGuard>
    );
}