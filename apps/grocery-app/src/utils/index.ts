// Export all utility functions from this file

// Utility function to format currency
export const formatCurrency = (amount: number, currency = "INR"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Utility function to capitalize first letter
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Export performance utilities
export * from './performance';

// Export location utilities
export * from './location';

// Note: haptics is imported directly where needed to avoid import chain issues
