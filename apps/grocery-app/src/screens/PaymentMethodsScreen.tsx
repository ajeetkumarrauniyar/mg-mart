import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SHADOWS } from '../constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AuthGuard, ScreenContainer } from '../components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface PaymentOptionProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    isActive?: boolean;
    isComingSoon?: boolean;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
    icon,
    title,
    description,
    isActive = false,
    isComingSoon = false
}) => {
    return (
        <View style={[styles.optionContainer, isComingSoon && styles.disabledOption]}>
            <View style={[styles.iconBox, { backgroundColor: isActive ? COLORS.primary + '15' : '#F8FAFC' }]}>
                <Ionicons name={icon} size={24} color={isActive ? COLORS.primary : '#94A3B8'} />
            </View>
            <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, isComingSoon && styles.disabledText]}>{title}</Text>
                <Text style={styles.optionDescription}>{isComingSoon ? 'Coming Soon' : description}</Text>
            </View>
            {isActive && (
                <View style={styles.activeBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                </View>
            )}
            {isComingSoon && (
                <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>SOON</Text>
                </View>
            )}
        </View>
    );
};

const PaymentMethodsContent: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <ScreenContainer
            header={
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Methods</Text>
                    <View style={{ width: 40 }} />
                </View>
            }
            bottomTabOffset
        >
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Methods</Text>
                <PaymentOption
                    icon="cash-outline"
                    title="Cash on Delivery"
                    description="Pay when you receive your order"
                    isActive={true}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Methods</Text>
                <PaymentOption
                    icon="phone-portrait-outline"
                    title="UPI"
                    description="PhonePe, Google Pay, Paytm"
                    isComingSoon={true}
                />
                <PaymentOption
                    icon="card-outline"
                    title="Credit / Debit Cards"
                    description="Visa, Mastercard, RuPay"
                    isComingSoon={true}
                />
                <PaymentOption
                    icon="wallet-outline"
                    title="Wallets"
                    description="Paytm, Amazon Pay"
                    isComingSoon={true}
                />
            </View>

            <View style={styles.infoCard}>
                <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
                <Text style={styles.infoText}>
                    Your payments are secure with MG Mart. We use industry-standard encryption.
                </Text>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    disabledOption: {
        opacity: 0.7,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    disabledText: {
        color: '#94A3B8',
    },
    optionDescription: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    activeBadge: {
        marginLeft: 10,
    },
    comingSoonBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    comingSoonText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '08',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        borderStyle: 'dashed',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.primary,
        lineHeight: 18,
        fontWeight: '500',
    },
});

export default function PaymentMethodsScreen() {
    return (
        <AuthGuard>
            <PaymentMethodsContent />
        </AuthGuard>
    );
}
