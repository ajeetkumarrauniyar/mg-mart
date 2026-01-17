# Fix for Infinite 401 Error Loop After Logout

## Problem Description
After logout, the app was experiencing an infinite loop of 401 errors with repeated API calls to `/cart/clear` and other
endpoints. The logs showed:
- Continuous 401 Unauthorized errors
- Repeated auth state clearing
- Navigation redirects in a loop
- API sync failures

## Root Causes Identified

### 1. **API Service 401 Handler Issue**
- The 401 error interceptor called `logout()` but didn't prevent subsequent API calls
- No request cancellation mechanism
- Pending requests continued after logout

### 2. **Background Cart Sync Operations**
- Cart operations (`addItem`, `updateItem`, `removeItem`, `clearCart`) made background API calls
- These calls didn't check authentication state before executing
- Continued to run after logout with expired tokens

### 3. **App Initialization Cart Sync**
- `useAppInitialization` always tried to sync cart if `isAuthenticated` was true
- Race condition between logout and initialization

### 4. **No Request Management**
- No way to cancel pending requests on logout
- No flag to prevent new API calls after logout

## Solutions Implemented

### 1. **Enhanced API Service (`apiService.ts`)**

#### Added Request Cancellation System:
```typescript
// Global state management
let isLoggedOut = false;
let pendingRequests: CancelTokenSource[] = [];

// Function to cancel all pending requests
const cancelAllPendingRequests = () => {
pendingRequests.forEach((source) => {
source.cancel('Request cancelled due to logout');
});
pendingRequests = [];
};

// Export function to control logout state
export const setLogoutState = (loggedOut: boolean) => {
isLoggedOut = loggedOut;
if (loggedOut) {
cancelAllPendingRequests();
}
};
```

#### Enhanced Request Interceptor:
- Blocks API calls when `isLoggedOut` is true
- Adds cancel tokens to all requests
- Tracks pending requests

#### Enhanced Response Interceptor:
- Removes completed/failed requests from pending list
- Handles cancelled requests properly
- Sets logout state on 401 to prevent further calls
- Only calls `logout()` once (prevents duplicate calls)

### 2. **Updated Auth Store (`authStore.ts`)**

#### Enhanced Logout Function:
```typescript
logout: () => {
// Set logout state in API service to prevent further API calls
try {
const { setLogoutState } = require('../services/apiService');
setLogoutState(true);
} catch (error) {
console.warn('Failed to set logout state in API service:', error);
}

// ... rest of logout logic
},
```

#### Enhanced Login Function:
- Resets logout state when logging in
- Ensures API calls are allowed after successful login

#### Enhanced loadStoredAuth Function:
- Resets logout state when loading stored authentication
- Prevents blocking of API calls for authenticated users

### 3. **Updated Cart Store (`cartStore.ts`)**

#### Authentication Checks for Background Sync:
All cart operations now check authentication before making API calls:

```typescript
// Example from addItem
try {
const { useAuthStore } = require('./authStore');
if (useAuthStore.getState().isAuthenticated) {
cartService.addItem({ productId, quantity })
.then(() => console.log("✅ API sync successful"))
.catch((error) => console.warn("⚠️ API sync failed:", error));
}
} catch (error) {
console.warn("Failed to check auth state for cart sync:", error);
}
```

This prevents:
- API calls with expired tokens
- Background sync operations after logout
- Unnecessary 401 errors

### 4. **Updated App Initialization (`useAppInitialization.ts`)**

#### Enhanced Cart Sync Logic:
```typescript
// If user is authenticated, sync cart with server
if (authStore.isAuthenticated && authStore.token) {
try {
// Add a small delay to ensure auth state is fully settled
await new Promise(resolve => setTimeout(resolve, 100));

// Double-check authentication before syncing
if (authStore.isAuthenticated) {
await cartStore.syncWithServer();
}
} catch (error) {
console.warn('Failed to sync cart with server:', error);
}
}
```

This prevents:
- Cart sync with invalid tokens
- Race conditions between logout and initialization
- Unnecessary API calls on app startup

## Key Improvements

### 1. **Request Lifecycle Management**
- All requests are tracked and can be cancelled
- Logout immediately cancels all pending requests
- New requests are blocked after logout

### 2. **Authentication State Synchronization**
- API service knows about logout state
- Cart operations check authentication before API calls
- Proper state reset on login

### 3. **Error Prevention**
- 401 handler only runs once per logout
- Background operations respect authentication state
- Race conditions eliminated

### 4. **Graceful Degradation**
- Local cart operations continue even if API fails
- App doesn't break if API service state management fails
- Proper error handling and logging

## Testing Recommendations

1. **Test Logout Flow:**
- Login → Add items to cart → Logout
- Verify no 401 errors after logout
- Verify no repeated API calls

2. **Test Login After Logout:**
- Logout → Login → Perform cart operations
- Verify API calls work normally after login

3. **Test App Restart:**
- Login → Close app → Restart app
- Verify cart sync works without 401 errors

4. **Test Network Scenarios:**
- Login → Disconnect network → Logout → Reconnect
- Verify no infinite loops when network returns

## Files Modified

1. `apps/grocery-app/src/services/apiService.ts` - Request management and 401 handling
2. `apps/grocery-app/src/stores/authStore.ts` - Logout state management
3. `apps/grocery-app/src/stores/cartStore.ts` - Authentication checks for API calls
4. `apps/grocery-app/src/hooks/useAppInitialization.ts` - Enhanced cart sync logic

The fix ensures that after logout, all pending API requests are cancelled, new requests are blocked, and the app
gracefully handles the transition without infinite error loops.