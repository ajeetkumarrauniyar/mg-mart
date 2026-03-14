import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Image,
    Animated,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - (SIZES.padding * 2);

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    color: string;
    tag?: string;
}

interface BannerCarouselProps {
    banners: Banner[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    const handleScroll = (event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / CAROUSEL_WIDTH);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={CAROUSEL_WIDTH + 16}
                contentContainerStyle={styles.scrollContent}
            >
                {banners.map((banner, index) => (
                    <TouchableOpacity
                        key={banner.id}
                        style={[styles.bannerCard, { backgroundColor: banner.color }]}
                        activeOpacity={0.9}
                    >
                        <View style={styles.textSection}>
                            {banner.tag && (
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tagText}>{banner.tag}</Text>
                                </View>
                            )}
                            <Text style={styles.title}>{banner.title}</Text>
                            <Text style={styles.subtitle}>{banner.subtitle}</Text>
                            <TouchableOpacity style={styles.ctaButton}>
                                <Text style={styles.ctaText}>Shop Now</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: banner.image }}
                            style={styles.bannerImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.pagination}>
                {banners.map((_, index) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [
                            (index - 1) * CAROUSEL_WIDTH,
                            index * CAROUSEL_WIDTH,
                            (index + 1) * CAROUSEL_WIDTH
                        ],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });
                    return (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                activeIndex === index ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    scrollContent: {
        paddingHorizontal: SIZES.padding,
    },
    bannerCard: {
        width: CAROUSEL_WIDTH,
        height: 160,
        borderRadius: SIZES.borderRadiusXLarge,
        marginRight: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.medium,
        overflow: 'hidden',
    },
    textSection: {
        flex: 1,
        zIndex: 2,
    },
    tagContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    tagText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: SIZES.fontSize.xxlarge,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: SIZES.fontSize.medium,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 12,
    },
    ctaButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    ctaText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: 'bold',
    },
    bannerImage: {
        width: 120,
        height: 120,
        marginLeft: 10,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    dot: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    activeDot: {
        width: 20,
        backgroundColor: COLORS.primary,
    },
    inactiveDot: {
        width: 6,
        backgroundColor: '#D1D5DB',
    },
});

export default BannerCarousel;
