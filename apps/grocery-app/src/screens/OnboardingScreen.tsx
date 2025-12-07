import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    emoji: string;
    title: string;
    description: string;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        emoji: '🛒',
        title: 'Welcome to MG-MART',
        description: 'Your one-stop shop for fresh groceries delivered to your doorstep',
    },
    {
        id: '2',
        emoji: '🥬',
        title: 'Fresh & Quality Products',
        description: 'Get farm-fresh vegetables, fruits, and daily essentials at the best prices',
    },
    {
        id: '3',
        emoji: '🚚',
        title: 'Fast Delivery',
        description: 'Quick and reliable delivery right to your home. Order now and get it today!',
    },
];

interface OnboardingScreenProps {
    onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            onComplete();
        }
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={styles.slide}>
            <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <FlatList
                    ref={slidesRef}
                    data={slides}
                    renderItem={renderSlide}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    scrollEventThrottle={32}
                />
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {slides.map((_, index) => {
                    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 24, 10],
                        extrapolate: 'clamp',
                    });
                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index.toString()}
                            style={[styles.dot, { width: dotWidth, opacity }]}
                        />
                    );
                })}
            </View>

            {/* Bottom Buttons */}
            <View style={styles.footer}>
                {currentIndex < slides.length - 1 ? (
                    <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.skipButton} />
                )}

                <TouchableOpacity onPress={scrollTo} style={styles.nextButton}>
                    <Text style={styles.nextText}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 3,
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emojiContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginHorizontal: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingBottom: 40,
    },
    skipButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 80,
    },
    skipText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: SIZES.borderRadius,
        minWidth: 120,
        alignItems: 'center',
    },
    nextText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
});
