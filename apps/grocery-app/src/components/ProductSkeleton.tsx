import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (SIZES.padding * 2) - 15) / 2;

export const ProductSkeleton: React.FC = () => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.image, { opacity }]} />
            <View style={styles.content}>
                <Animated.View style={[styles.titleLine, { opacity }]} />
                <Animated.View style={[styles.subLine, { opacity }]} />
                <View style={styles.footer}>
                    <Animated.View style={[styles.price, { opacity }]} />
                    <Animated.View style={[styles.button, { opacity }]} />
                </View>
            </View>
        </View>
    );
};

export const ProductsGridSkeleton: React.FC = () => {
    return (
        <View style={styles.gridContainer}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductSkeleton key={i} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 16,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#E1E9EE',
    },
    content: {
        padding: 10,
    },
    titleLine: {
        height: 14,
        width: '80%',
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
        marginBottom: 8,
    },
    subLine: {
        height: 10,
        width: '40%',
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        height: 20,
        width: '40%',
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
    button: {
        height: 28,
        width: 40,
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
});

export default ProductSkeleton;
