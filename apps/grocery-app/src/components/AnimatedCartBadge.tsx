import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants';

interface AnimatedCartBadgeProps {
    count: number;
}

export const AnimatedCartBadge: React.FC<AnimatedCartBadgeProps> = ({ count }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevCountRef = useRef(count);

    useEffect(() => {
        // Only animate when count increases
        if (count > prevCountRef.current && count > 0) {
            // Bounce animation
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.3,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }
        prevCountRef.current = count;
    }, [count, scaleAnim]);

    if (count === 0) return null;

    return (
        <Animated.View
            style={[
                styles.badge,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <Text style={styles.badgeText}>
                {count > 99 ? '99+' : count}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -8,
        top: -4,
        backgroundColor: COLORS.error || '#e53e3e',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: COLORS.white,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
});
