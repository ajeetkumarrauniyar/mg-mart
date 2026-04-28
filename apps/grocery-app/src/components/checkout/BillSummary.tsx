import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '@/constants';

export interface BillSummaryProps {
  totalAmount: number;
  deliveryFee: number;
  handlingFee: number;
  grandTotal: number;
  qualifyingAmount?: number;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  totalAmount,
  deliveryFee,
  handlingFee,
  grandTotal,
  qualifyingAmount,
}) => {
  const isFreeDelivery = deliveryFee === 0 && totalAmount > 0;
  const amountToFreeDelivery = qualifyingAmount !== undefined && qualifyingAmount < 499
    ? Math.ceil(499 - qualifyingAmount)
    : 0;

  return (
    <View style={billStyles.container}>
      <Text style={billStyles.heading}>Bill summary</Text>

      {/* Free delivery progress hint */}
      {amountToFreeDelivery > 0 && (
        <View style={billStyles.freeDeliveryHint}>
          <Ionicons name="bicycle-outline" size={14} color="#16a34a" />
          <Text style={billStyles.freeDeliveryHintText}>
            Add ₹{amountToFreeDelivery} more for free delivery
          </Text>
        </View>
      )}

      <View style={billStyles.row}>
        <View style={billStyles.labelGroup}>
          <Ionicons name="receipt-outline" size={18} color={COLORS.textLight} />
          <Text style={billStyles.label}>Item total</Text>
        </View>
        <Text style={billStyles.value}>₹{totalAmount.toFixed(0)}</Text>
      </View>

      <View style={billStyles.row}>
        <View style={billStyles.labelGroup}>
          <Ionicons name="bicycle-outline" size={18} color={COLORS.textLight} />
          <Text style={billStyles.label}>Delivery fee</Text>
        </View>
        {isFreeDelivery ? (
          <Text style={billStyles.freeLabel}>FREE</Text>
        ) : (
          <Text style={billStyles.value}>₹{deliveryFee}</Text>
        )}
      </View>

      <View style={billStyles.row}>
        <View style={billStyles.labelGroup}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textLight} />
          <Text style={billStyles.label}>Handling fee</Text>
        </View>
        <Text style={billStyles.value}>₹{handlingFee}</Text>
      </View>

      <View style={billStyles.divider} />

      <View style={billStyles.row}>
        <Text style={billStyles.totalLabel}>Grand total</Text>
        <Text style={billStyles.totalValue}>₹{grandTotal.toFixed(0)}</Text>
      </View>
    </View>
  );
};

const billStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: SIZES.padding,
    marginTop: 8,
    borderRadius: SIZES.borderRadiusLarge,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  heading: {
    fontSize: SIZES.fontSize.large,      // 18px
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: SIZES.fontSize.medium,     // 15px (was 13px)
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: SIZES.fontSize.medium,     // 15px (was 13px)
    fontWeight: SIZES.fontWeight.semibold,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: SIZES.fontSize.large,      // 18px
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.fontSize.large,      // 18px
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
  },
  freeLabel: {
    fontSize: SIZES.fontSize.medium,
    fontWeight: SIZES.fontWeight.bold,
    color: '#16a34a',
  },
  freeDeliveryHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  freeDeliveryHintText: {
    fontSize: SIZES.fontSize.small,
    color: '#16a34a',
    fontWeight: SIZES.fontWeight.semibold,
    flex: 1,
  },
});
