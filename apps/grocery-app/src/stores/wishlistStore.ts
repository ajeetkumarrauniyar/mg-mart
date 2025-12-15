import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@mg-mart/types";

export interface WishlistStore {
    // State
    wishlistItems: Product[];

    // Actions
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
    toggleWishlist: (product: Product) => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            // Initial state
            wishlistItems: [],

            // Actions
            addToWishlist: (product: Product) => {
                const { wishlistItems } = get();
                const existingItem = wishlistItems.find(item => item.productId === product.productId);

                if (!existingItem) {
                    set({
                        wishlistItems: [...wishlistItems, product],
                    });
                }
            },

            removeFromWishlist: (productId: string) => {
                const { wishlistItems } = get();
                set({
                    wishlistItems: wishlistItems.filter(item => item.productId !== productId),
                });
            },

            isInWishlist: (productId: string) => {
                const { wishlistItems } = get();
                return wishlistItems.some(item => item.productId === productId);
            },

            clearWishlist: () => {
                set({ wishlistItems: [] });
            },

            toggleWishlist: (product: Product) => {
                const { isInWishlist, addToWishlist, removeFromWishlist } = get();
                if (isInWishlist(product.productId)) {
                    removeFromWishlist(product.productId);
                } else {
                    addToWishlist(product);
                }
            },
        }),
        {
            name: "wishlist-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);