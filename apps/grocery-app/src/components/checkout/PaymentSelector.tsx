import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, PAYMENT_METHODS } from '@/constants';

export interface PaymentSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  selected,
  onSelect,
}) => (
  <View style={payStyles.container}>
    <Text style={payStyles.heading}>Payment method</Text>
    {PAYMENT_METHODS.filter((m) => m.visible).map((method) => {
      const active = selected === method.id;
      return (
        <TouchableOpacity
          key={method.id}
          style={[payStyles.card, active && payStyles.cardActive]}
          onPress={() => onSelect(method.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={method.icon as any}
            size={24}
            color={active ? COLORS.primary : COLORS.textLight}
          />
          <View style={payStyles.info}>
            <Text style={payStyles.title}>{method.title}</Text>
            <Text style={payStyles.sub}>{method.sub}</Text>
          </View>
          {/* Radio dot */}
          <View style={[payStyles.radio, active && payStyles.radioActive]}>
            {active && <View style={payStyles.radioDot} />}
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

const payStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 10,
  },
  heading: {
    fontSize: SIZES.fontSize.large,
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.borderRadiusLarge,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardActive: {
    backgroundColor: COLORS.primary + '08',
    borderColor: COLORS.primary,
  },
  info: { flex: 1 },
  title: {
    fontSize: SIZES.fontSize.medium,     // 15px (was 14px)
    fontWeight: SIZES.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  sub: {
    fontSize: SIZES.fontSize.small,      // 14px (was 11px)
    color: COLORS.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
});
