import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { COLORS } from '../constants';
import { ScreenContainer, AppHeader } from '../components';

const TermsAndConditionsScreen: React.FC = () => {

    return (
        <ScreenContainer
            header={<AppHeader title="Terms & Conditions" />}
            bottomTabOffset
        >
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.lastUpdated}>Last Updated: March 14, 2026</Text>

                    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                    <Text style={styles.text}>
                        By accessing and using MG Mart (the &quot;App&quot;), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the App.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Use of the App</Text>
                    <Text style={styles.text}>
                        You must be at least 18 years old or under the supervision of a parent or legal guardian to use this App. You are responsible for maintaining the confidentiality of your account credentials.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Ordering and Delivery</Text>
                    <Text style={styles.text}>
                        • All orders are subject to availability and acceptance.
                        {'\n'}• Delivery times are estimates and may vary due to external factors.
                        {'\n'}• We reserve the right to refuse service to anyone at any time.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Pricing and Payment</Text>
                    <Text style={styles.text}>
                        Prices are subject to change without notice. Payments can be made via Cash on Delivery or other available digital methods. All digital transactions are processed securely.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Cancellations and Refunds</Text>
                    <Text style={styles.text}>
                        Orders can be cancelled before they are &quot;Out for Delivery&quot;. Selection of items for return or refund is subject to our quality check and return policy guidelines.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
                    <Text style={styles.text}>
                        All content on the App, including logos, text, graphics, and software, is the property of MG Mart and is protected by intellectual property laws.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
                    <Text style={styles.text}>
                        MG Mart shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.
                    </Text>

                    <Text style={styles.sectionTitle}>8. Governing Law</Text>
                    <Text style={styles.text}>
                        These terms shall be governed by and construed in accordance with the laws of India.
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            © 2026 MG Mart. All rights reserved.
                        </Text>
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
    backBtn: {
        padding: 4,
        marginLeft: -4,
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
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});

export default TermsAndConditionsScreen;
