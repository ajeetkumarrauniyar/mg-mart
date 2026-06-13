# Wishlist/Favourite Feature

## Overview
The wishlist feature allows users to save their favorite products for later purchase. Users can easily add/remove items
from their wishlist and view all saved items in a dedicated screen.

## Features Implemented

### 1. Wishlist Store (`src/stores/wishlistStore.ts`)
- **State Management**: Uses Zustand with persistence via AsyncStorage
- **Actions**:
- `addToWishlist(product)`: Add a product to wishlist
- `removeFromWishlist(productId)`: Remove a product from wishlist
- `toggleWishlist(product)`: Toggle wishlist status
- `isInWishlist(productId)`: Check if product is in wishlist
- `clearWishlist()`: Remove all items from wishlist

### 2. Wishlist Screen (`src/screens/WishlistScreen.tsx`)
- **Empty State**: Shows when no items are in wishlist
- **Item Display**: Shows product image, name, description, price, and stock status
- **Actions**: Remove from wishlist, add to cart
- **Clear All**: Option to clear entire wishlist with confirmation
- **Item Count**: Shows total number of items in wishlist

### 3. Product Card Integration
- **Heart Icon**: Added to product cards in ProductsScreen
- **Visual Feedback**: Filled heart for wishlisted items, outline for non-wishlisted
- **Positioning**: Top-right corner with semi-transparent background
- **Touch Handling**: Prevents card navigation when tapping wishlist button

### 4. Navigation Integration
- **Tab Navigator**: Added "Favourite" tab with heart icon
- **Badge**: Shows count of wishlist items (similar to cart badge)
- **Navigation**: Accessible from bottom tab bar

## UI/UX Design
- **Consistent Styling**: Follows app's design system (colors, fonts, spacing)
- **Responsive Layout**: Works on different screen sizes
- **Accessibility**: Proper touch targets and visual feedback
- **Performance**: Optimized with proper state management and rendering

## Usage
1. **Adding to Wishlist**: Tap the heart icon on any product card
2. **Viewing Wishlist**: Navigate to "Favourite" tab in bottom navigation
3. **Removing from Wishlist**: Tap the filled heart icon on product card or remove button in wishlist screen
4. **Adding to Cart**: From wishlist screen, tap "Add to Cart" button
5. **Clearing Wishlist**: Use "Clear All" button in wishlist screen header

## Technical Implementation
- **State Persistence**: Wishlist data persists across app sessions
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Graceful handling of edge cases
- **Performance**: Efficient re-renders with Zustand selectors