import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  COLORS,
  SIZES,
  SHADOWS,
  SLOTS,
  PAYMENT_METHODS,
  ZIP_CODE,
  MIN_ORDER_VALUE,
} from '@/constants';
import { useCartStore, useLocationStore, CartItemWithProduct } from '@/stores';
import { RootStackParamList } from '@/navigation/AppNavigator';
import {
  AuthGuard,
  OptimizedImage,
  QuantityStepper,
  ScreenContainer,
  AppHeader,
  MinOrderBanner,
  DeliveryStatusBanner,
  LocationPermissionModal,
} from '@/components';
import { BillSummary, SlotSelector, PaymentSelector, AddressSection } from '../components/checkout';

import {
  locationService,
  PermissionStatus,
  type LocationValidationResult,
} from '@/services/location';
import { orderService } from '@/services';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// ─── Cart item row ────────────────────────────────────────────────────────────

interface CartItemRowProps {
  item: CartItemWithProduct;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onPress: () => void;
  isLoading: boolean;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onPress,
  isLoading,
}) => (
  <View style={itemStyles.row}>
    {/* Product image — tappable */}
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <OptimizedImage
        source={{ uri: item.imageUrl || '' }}
        style={itemStyles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>

    {/* Details */}
    <View style={itemStyles.details}>
      <View style={itemStyles.nameRow}>
        <TouchableOpacity onPress={onPress} style={itemStyles.namePressable}>
          <Text style={itemStyles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={itemStyles.unit}>{item.unit}</Text>
        </TouchableOpacity>

        {/* Remove button — 40×40 touch target */}
        <TouchableOpacity
          onPress={onRemove}
          style={itemStyles.removeBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={`Remove ${item.name} from cart`}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Price + stepper */}
      <View style={itemStyles.footer}>
        <Text style={itemStyles.subtotal}>₹{item.subtotal.toFixed(0)}</Text>
        <QuantityStepper
          quantity={item.quantity}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          isLoading={isLoading}
        />
      </View>
    </View>
  </View>
);

const itemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLarge,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  image: {
    width: 90,                           // was 70px — more visual weight
    height: 90,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.backgroundDark,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  namePressable: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.fontSize.medium,     // 15px (was 14px)
    fontWeight: SIZES.fontWeight.semibold,
    color: COLORS.text,
    lineHeight: 21,
    marginBottom: 2,
  },
  unit: {
    fontSize: SIZES.fontSize.small,      // 14px (was 11px)
    color: COLORS.textSecondary,
  },
  removeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  subtotal: {
    fontSize: SIZES.fontSize.xlarge,     // 20px (was 16px) — make price obvious
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
  },
});

// ─── Main CartContent ─────────────────────────────────────────────────────────

function CartContent() {
  const navigation = useNavigation<NavigationProp>();

  const {
    items,
    totalAmount,
    qualifyingAmount,
    totalItems,
    deliveryFee,
    handlingFee,
    grandTotal,
    isLoading,
    updateItem,
    removeItem,
    clearCart,
  } = useCartStore();

  const { locationName } = useLocationStore();

  const [selectedSlot, setSelectedSlot] = useState<string>(SLOTS[0].id);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Location validation
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [validationResult, setValidationResult] =
    useState<LocationValidationResult | null>(null);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    'unknown' | 'checking' | 'valid' | 'invalid'
  >('unknown');

  // ── Derived state ───────────────────────────────────────────────────────────
  const belowMinimum = qualifyingAmount < MIN_ORDER_VALUE && qualifyingAmount > 0;
  const remaining = Math.max(0, MIN_ORDER_VALUE - qualifyingAmount);
  const canPlaceOrder =
    items.length > 0 && qualifyingAmount >= MIN_ORDER_VALUE && locationStatus === 'valid';

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleQuantityChange = useCallback(
    async (item: CartItemWithProduct, delta: number) => {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        Alert.alert(
          'Remove item?',
          `Remove ${item.name} from your cart?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => removeItem(item.productId),
            },
          ]
        );
        return;
      }
      try {
        await updateItem(item.productId, newQty);
      } catch {
        Alert.alert('Error', 'Could not update quantity. Please try again.');
      }
    },
    [updateItem, removeItem]
  );

  const handleRemoveItem = useCallback(
    (item: CartItemWithProduct) => {
      Alert.alert(
        'Remove item',
        `Remove ${item.name} from your cart?`,
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeItem(item.productId),
          },
        ]
      );
    },
    [removeItem]
  );

  const handleClearCart = useCallback(() => {
    Alert.alert('Clear cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all',
        style: 'destructive',
        onPress: () => clearCart(),
      },
    ]);
  }, [clearCart]);

  const handleLocationValidation = useCallback(async () => {
    setIsValidatingLocation(true);
    try {
      const serviceStatus = await locationService.getServiceStatus();
      if (serviceStatus.permissionStatus !== PermissionStatus.GRANTED) {
        setShowPermissionModal(true);
        return;
      }
      const result = await locationService.validateOrderLocation();
      setValidationResult(result);
      if (result.isValid) {
        setLocationStatus('valid');
      } else {
        setLocationStatus('invalid');
      }
    } catch {
      Alert.alert('Location error', 'Unable to verify location. Please try again.');
    } finally {
      setIsValidatingLocation(false);
    }
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0) return;

    // ── ₹500 minimum guard ──────────────────────────────────────────────────
    if (qualifyingAmount < MIN_ORDER_VALUE) {
      Alert.alert(
        'Minimum order ₹500',
        `Add ₹${remaining.toFixed(0)} more to place your order.`
      );
      return;
    }

    if (locationStatus !== 'valid') {
      await handleLocationValidation();
      return;
    }

    if (!locationName || locationName.trim() === '') {
      Alert.alert('Missing Location', 'Please verify your delivery location before placing the order.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await orderService.createOrder({
        paymentMethod: selectedPayment as any,
        shippingAddress: {
          street: locationName || 'Current Location',
          city: 'Jahingara',
          state: 'Bihar',
          zipCode: ZIP_CODE,
        },
        notes: `Slot: ${SLOTS.find((s) => s.id === selectedSlot)?.time}`,
      });

      await clearCart();

      Alert.alert(
        'Order placed!',
        `Order #${order.orderId} will be delivered to you. Thank you!`,
        [
          {
            text: 'View order',
            onPress: () => navigation.navigate('OrderHistory'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Order failed', error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  }, [
    items,
    totalAmount,
    remaining,
    locationStatus,
    selectedPayment,
    selectedSlot,
    locationName,
    handleLocationValidation,
    clearCart,
    navigation,
  ]);

  // ── Footer ──────────────────────────────────────────────────────────────────

  const footer = useMemo(() => {
    if (items.length === 0) return undefined;

    return (
      <View style={footerStyles.container}>
        {/* ₹500 nudge inside the footer when below minimum */}
        {belowMinimum && (
          <View style={footerStyles.nudge}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={COLORS.warning}
            />
            <Text style={footerStyles.nudgeText}>
              Add ₹{remaining.toFixed(0)} more to unlock delivery
            </Text>
          </View>
        )}

        <View style={footerStyles.row}>
          {/* Total */}
          <View style={footerStyles.totalArea}>
            <Text style={footerStyles.totalPrice}>
              ₹{grandTotal.toFixed(0)}
            </Text>
            <Text style={footerStyles.totalSub}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {/* Place order CTA */}
          <TouchableOpacity
            style={[
              footerStyles.placeBtn,
              (!canPlaceOrder || isPlacingOrder) &&
              footerStyles.placeBtnDisabled,
            ]}
            onPress={handlePlaceOrder}
            disabled={!canPlaceOrder || isPlacingOrder}
            accessibilityLabel={
              belowMinimum
                ? `Add ₹${remaining.toFixed(0)} more to place order`
                : 'Place order'
            }
          >
            {isPlacingOrder ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Text style={footerStyles.placeBtnText}>
                  {belowMinimum
                    ? `Need ₹${remaining.toFixed(0)} more`
                    : 'Place order'}
                </Text>
                {!belowMinimum && (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={COLORS.white}
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [
    items.length,
    belowMinimum,
    remaining,
    grandTotal,
    totalItems,
    canPlaceOrder,
    isPlacingOrder,
    handlePlaceOrder,
  ]);

  // ── List sections rendered below the item list ───────────────────────────

  const ListFooterComponent = useMemo(() => {
    if (items.length === 0) return null;

    return (
      <>
        {/* ₹500 minimum progress banner */}
        <MinOrderBanner currentTotal={totalAmount} qualifyingAmount={qualifyingAmount} />

        {/* Bill */}
        <BillSummary
          totalAmount={totalAmount}
          deliveryFee={deliveryFee}
          handlingFee={handlingFee}
          grandTotal={grandTotal}
        />

        {/* Address */}
        <AddressSection
          locationName={locationName}
          locationStatus={locationStatus}
          isValidating={isValidatingLocation}
          errorText={validationResult?.message || "Outside 5km delivery radius. Please update address."}
          onVerify={handleLocationValidation}
          onChangeAddress={() =>
            navigation.navigate('LocationSelection')
          }
        />

        {/* Delivery slot */}
        <SlotSelector
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
        />

        {/* Payment */}
        <PaymentSelector
          selected={selectedPayment}
          onSelect={setSelectedPayment}
        />

        <View style={{ height: 24 }} />
      </>
    );
  }, [
    items.length,
    totalAmount,
    deliveryFee,
    handlingFee,
    grandTotal,
    locationName,
    locationStatus,
    isValidatingLocation,
    selectedSlot,
    selectedPayment,
    handleLocationValidation,
    navigation,
  ]);

  // ── Empty cart state ────────────────────────────────────────────────────────

  const EmptyCart = useMemo(
    () => (
      <View style={emptyStyles.container}>
        <View style={emptyStyles.iconCircle}>
          <Ionicons name="cart-outline" size={72} color={COLORS.border} />
        </View>
        <Text style={emptyStyles.title}>Your cart is empty</Text>
        <Text style={emptyStyles.body}>
          Add items from the store to get started.
        </Text>
        <TouchableOpacity
          style={emptyStyles.shopBtn}
          onPress={() =>
            navigation.navigate('MainTabs', { screen: 'Products' })
          }
        >
          <Text style={emptyStyles.shopBtnText}>Browse products</Text>
        </TouchableOpacity>
      </View>
    ),
    [navigation]
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="My cart"
          showBackButton={false}
          subtitle={
            totalItems > 0
              ? `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
              : undefined
          }
          rightAction={
            items.length > 0 ? (
              <TouchableOpacity
                onPress={handleClearCart}
                style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                accessibilityLabel="Clear cart"
              >
                <Ionicons
                  name="trash-outline"
                  size={SIZES.icon.large}
                  color={COLORS.error}
                />
              </TouchableOpacity>
            ) : undefined
          }
        />
      }
      scrollable={false}
      bottomTabOffset
      footer={footer}
    >
      {/* Peak-hour banner at top of cart */}
      <DeliveryStatusBanner />

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onIncrease={() => handleQuantityChange(item, 1)}
            onDecrease={() => handleQuantityChange(item, -1)}
            onRemove={() => handleRemoveItem(item)}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: item.productId,
              })
            }
            isLoading={isLoading}
          />
        )}
        keyExtractor={(item) => item.productId}
        ListEmptyComponent={EmptyCart}
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={{ height: 12 }} />
          ) : null
        }
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={
          items.length === 0 ? cartStyles.emptyList : undefined
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Modals */}
      <LocationPermissionModal
        visible={showPermissionModal}
        onPermissionGranted={() => setShowPermissionModal(false)}
        onPermissionDenied={() => setShowPermissionModal(false)}
        onClose={() => setShowPermissionModal(false)}
      />
    </ScreenContainer>
  );
}

// ─── Styles shared by CartContent ────────────────────────────────────────────

const cartStyles = StyleSheet.create({
  emptyList: { flexGrow: 1 },
});

const footerStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.large,
    gap: 10,
  },
  // Nudge row shown when below ₹500
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  nudgeText: {
    flex: 1,
    fontSize: SIZES.fontSize.small,
    fontWeight: SIZES.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalArea: { flex: 1 },
  totalPrice: {
    fontSize: SIZES.fontSize.xxlarge,   // 24px
    fontWeight: SIZES.fontWeight.extrabold,
    color: COLORS.text,
  },
  totalSub: {
    fontSize: SIZES.fontSize.small,
    color: COLORS.textSecondary,
    fontWeight: SIZES.fontWeight.medium,
  },
  placeBtn: {
    height: SIZES.button.large,         // 54px
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    borderRadius: SIZES.borderRadiusLarge,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.medium,
  },
  placeBtnDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  placeBtnText: {
    color: COLORS.white,
    fontSize: SIZES.fontSize.medium,
    fontWeight: SIZES.fontWeight.bold,
  },
});

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingLarge,
    gap: 12,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: SIZES.fontSize.xlarge,
    fontWeight: SIZES.fontWeight.bold,
    color: COLORS.text,
  },
  body: {
    fontSize: SIZES.fontSize.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  shopBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingLarge,
    height: SIZES.button.large,
    borderRadius: SIZES.borderRadiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopBtnText: {
    color: COLORS.white,
    fontSize: SIZES.fontSize.medium,
    fontWeight: SIZES.fontWeight.bold,
  },
});

// ─── Default export with AuthGuard ────────────────────────────────────────────

export default function CartScreen() {
  return (
    <AuthGuard fallbackMessage="Please log in to view your cart">
      <CartContent />
    </AuthGuard>
  );
}