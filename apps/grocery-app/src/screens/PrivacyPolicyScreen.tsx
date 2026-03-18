import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from '../constants';
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenContainer } from '../components';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const PrivacyPolicyScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <ScreenContainer
            header={
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={{ width: 40 }} />
                </View>
            }
            bottomTabOffset
        >
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.lastUpdated}>Last Updated: March 14, 2026</Text>

                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.text}>
                        Welcome to MG Mart. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                    <Text style={styles.text}>
                        We collect information that you provide directly to us, such as when you create an account, place an order, or contact customer support. This may include your name, email address, phone number, and delivery address.
                    </Text>

                    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                    <Text style={styles.text}>
                        We use the information we collect to:
                        {'\n'}• Process and deliver your orders
                        {'\n'}• Send order confirmations and updates
                        {'\n'}• Provide customer support
                        {'\n'}• Improve our services and user experience
                        {'\n'}• Send promotional offers (if you opt-in)
                    </Text>

                    <Text style={styles.sectionTitle}>4. Data Security</Text>
                    <Text style={styles.text}>
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction. We use industry-standard encryption for all data transmissions.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Sharing of Information</Text>
                    <Text style={styles.text}>
                        We do NOT sell your personal information. We may share your data with:
                        {'\n'}• Delivery partners (to deliver your orders)
                        {'\n'}• Payment processors (to handle transactions)
                        {'\n'}• Legal authorities (if required by law)
                    </Text>

                    <Text style={styles.sectionTitle}>6. Your Rights</Text>
                    <Text style={styles.text}>
                        You have the right to access, correct, or delete your personal information. You can manage your profile settings directly in the app or contact our support team for assistance.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
                    <Text style={styles.text}>
                        We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy in the app.
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            If you have any questions about this Privacy Policy, please contact us at{' '}
                        </Text>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@mgmart.com')}>
                            <Text style={{ color: '#007AFF', textDecorationLine: 'underline', textAlign: 'center' }}>
                                support@mgsupermart.com
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    lastUpdated: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 20,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        color: '#4A5568',
        lineHeight: 22,
    },
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    footerText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default PrivacyPolicyScreen;
