// Location validation feedback modal component
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    locationService,
    messageService,
    ValidationType,
    type LocationValidationResult
} from '../../services/location';

interface LocationValidationModalProps {
    visible: boolean;
    validationResult: LocationValidationResult | null;
    onValidationSuccess: () => void;
    onValidationFailure: () => void;
    onClose: () => void;
}

export const LocationValidationModal: React.FC<LocationValidationModalProps> = ({
    visible,
    validationResult,
    onValidationSuccess,
    onValidationFailure,
    onClose,
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    if (!validationResult) return null;

    const handleRefreshLocation = async () => {
        setIsRefreshing(true);

        try {
            await locationService.refreshLocation();
            const newValidation = await locationService.validateOrderLocation();

            if (newValidation.isValid) {
                Alert.alert(
                    'Success',
                    messageService.getSuccessMessage('refresh'),
                    [{ text: 'OK', onPress: onValidationSuccess }]
                );
            } else {
                Alert.alert(
                    'Still Outside Area',
                    newValidation.message,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to refresh location. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleUpdateAddress = () => {
        Alert.alert(
            'Update Address',
            'This feature will allow you to update your delivery address.',
            [{ text: 'OK' }]
        );
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'Please contact our support team for assistance with location issues.',
            [{ text: 'OK' }]
        );
    };

    const getModalStyle = () => {
        switch (validationResult.validationType) {
            case ValidationType.APPROVED:
                return styles.successModal;
            case ValidationType.WARNING:
                return styles.warningModal;
            case ValidationType.BLOCKED:
                return styles.errorModal;
            default:
                return styles.defaultModal;
        }
    };

    const getIconColor = () => {
        switch (validationResult.validationType) {
            case ValidationType.APPROVED:
                return '#48bb78';
            case ValidationType.WARNING:
                return '#ed8936';
            case ValidationType.BLOCKED:
                return '#f56565';
            default:
                return '#4a5568';
        }
    };

    const renderActions = () => {
        if (validationResult.validationType === ValidationType.APPROVED) {
            return (
                <TouchableOpacity
                    style={[styles.button, styles.successButton]}
                    onPress={onValidationSuccess}
                >
                    <Text style={styles.successButtonText}>Continue Order</Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.actions}>
                {validationResult.validationType === ValidationType.WARNING && (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={onValidationSuccess}
                    >
                        <Text style={styles.primaryButtonText}>Continue Anyway</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleRefreshLocation}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <ActivityIndicator color="#4a5568" size="small" />
                    ) : (
                        <Text style={styles.secondaryButtonText}>Refresh Location</Text>
                    )}
                </TouchableOpacity>

                {validationResult.validationType === ValidationType.BLOCKED && (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleUpdateAddress}
                        >
                            <Text style={styles.secondaryButtonText}>Update Address</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleContactSupport}
                        >
                            <Text style={styles.secondaryButtonText}>Contact Support</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, getModalStyle()]}>
                    <View style={styles.header}>
                        <View style={[styles.icon, { backgroundColor: getIconColor() }]}>
                            <Text style={styles.iconText}>
                                {validationResult.validationType === ValidationType.APPROVED ? '✓' :
                                    validationResult.validationType === ValidationType.WARNING ? '⚠' : '✕'}
                            </Text>
                        </View>

                        <Text style={styles.title}>
                            {validationResult.validationType === ValidationType.APPROVED ? 'Order Approved' :
                                validationResult.validationType === ValidationType.WARNING ? 'Please Confirm' :
                                    'Order Cannot Be Placed'}
                        </Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.message}>
                            {validationResult.message}
                        </Text>

                        <Text style={styles.distanceInfo}>
                            {messageService.getDistanceMessage(validationResult.distance)}
                        </Text>

                        {validationResult.validationType !== ValidationType.APPROVED && (
                            <Text style={styles.helpText}>
                                {messageService.getHelpMessage(
                                    validationResult.validationType === ValidationType.BLOCKED ? 'blocked' : 'general'
                                )}
                            </Text>
                        )}
                    </View>

                    {renderActions()}

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        minHeight: 300,
    },
    successModal: {
        borderTopColor: '#48bb78',
        borderTopWidth: 4,
    },
    warningModal: {
        borderTopColor: '#ed8936',
        borderTopWidth: 4,
    },
    errorModal: {
        borderTopColor: '#f56565',
        borderTopWidth: 4,
    },
    defaultModal: {
        borderTopColor: '#4a5568',
        borderTopWidth: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    icon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
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
    distanceInfo: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 12,
    },
    helpText: {
        fontSize: 14,
        color: '#a0aec0',
        lineHeight: 20,
        textAlign: 'center',
    },
    actions: {
        gap: 12,
        marginBottom: 16,
    },
    button: {
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
    successButton: {
        backgroundColor: '#48bb78',
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
    successButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    closeButtonText: {
        color: '#a0aec0',
        fontSize: 14,
    },
});