// Location permission request modal component
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { locationService, messageService, PermissionStatus } from '../../services/location';

interface LocationPermissionModalProps {
    visible: boolean;
    onPermissionGranted: () => void;
    onPermissionDenied: () => void;
    onClose: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
    visible,
    onPermissionGranted,
    onPermissionDenied,
    onClose,
}) => {
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestPermission = async () => {
        setIsRequesting(true);

        try {
            const status = await locationService.requestLocationPermission();

            switch (status) {
                case PermissionStatus.GRANTED:
                    onPermissionGranted();
                    break;

                case PermissionStatus.DENIED:
                    Alert.alert(
                        'Permission Denied',
                        messageService.getPermissionMessage(status),
                        [
                            { text: 'Cancel', onPress: onPermissionDenied },
                            { text: 'Try Again', onPress: handleRequestPermission },
                        ]
                    );
                    break;

                case PermissionStatus.NEVER_ASK_AGAIN:
                    Alert.alert(
                        'Permission Required',
                        messageService.getPermissionMessage(status),
                        [
                            { text: 'Cancel', onPress: onPermissionDenied },
                            {
                                text: 'Open Settings',
                                onPress: () => {
                                    // Open device settings
                                    // This would be implemented based on platform
                                    onPermissionDenied();
                                }
                            },
                        ]
                    );
                    break;

                default:
                    onPermissionDenied();
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to request location permission. Please try again.',
                [{ text: 'OK', onPress: onPermissionDenied }]
            );
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Location Access Required</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.message}>
                            {messageService.getHelpMessage('permission')}
                        </Text>

                        <Text style={styles.subMessage}>
                            {messageService.getDeliveryAreaInfo()}
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={onClose}
                            disabled={isRequesting}
                        >
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleRequestPermission}
                            disabled={isRequesting}
                        >
                            {isRequesting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Allow Location</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.privacy}>
                        <Text style={styles.privacyText}>
                            {messageService.getPrivacyMessage()}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a202c',
        textAlign: 'center',
    },
    content: {
        marginBottom: 24,
    },
    message: {
        fontSize: 16,
        color: '#4a5568',
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 12,
    },
    subMessage: {
        fontSize: 14,
        color: '#718096',
        lineHeight: 20,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    primaryButton: {
        backgroundColor: '#48bb78',
    },
    secondaryButton: {
        backgroundColor: '#e2e8f0',
        borderWidth: 1,
        borderColor: '#cbd5e0',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#4a5568',
        fontSize: 16,
        fontWeight: '600',
    },
    privacy: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    privacyText: {
        fontSize: 12,
        color: '#a0aec0',
        lineHeight: 16,
        textAlign: 'center',
    },
});