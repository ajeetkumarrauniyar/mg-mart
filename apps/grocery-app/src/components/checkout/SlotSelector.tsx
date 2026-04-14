import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SLOTS } from '@/constants';

export interface SlotSelectorProps {
  selectedSlot: string;
  onSelect: (id: string) => void;
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({
  selectedSlot,
  onSelect,
}) => (
  <View style={slotStyles.container}>
    <Text style={slotStyles.heading}>Choose delivery slot</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={slotStyles.scroll}
    >
      {SLOTS.map((slot) => {
        const active = selectedSlot === slot.id;
        return (
          <TouchableOpacity
            key={slot.id}
            style={[slotStyles.card, active && slotStyles.cardActive]}
            onPress={() => onSelect(slot.id)}
            activeOpacity={0.75}
          >
            <Text style={[slotStyles.time, active && slotStyles.timeActive]}>
              {slot.time}
            </Text>
            <Text style={[slotStyles.desc, active && slotStyles.descActive]}>
              {slot.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const slotStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingLeft: SIZES.padding,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  heading: {
    fontSize: SIZES.fontSize.large,      // 18px
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
    marginBottom: 12,
  },
  scroll: {
    paddingRight: SIZES.padding,
    gap: 10,
  },
  card: {
    width: 162,
    padding: 12,
    borderRadius: SIZES.borderRadiusLarge,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardActive: {
    backgroundColor: COLORS.primary + '12',
    borderColor: COLORS.primary,
  },
  time: {
    fontSize: SIZES.fontSize.medium,     // 15px (was 13px)
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
    marginBottom: 3,
  },
  timeActive: { color: COLORS.primaryDark },
  desc: {
    fontSize: SIZES.fontSize.small,      // 14px (was 11px)
    color: COLORS.textSecondary,
  },
  descActive: { color: COLORS.primary },
});
