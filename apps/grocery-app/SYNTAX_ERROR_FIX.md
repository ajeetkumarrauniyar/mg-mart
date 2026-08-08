# Fix for Syntax Error in DistanceCalculator.ts

## Problem
The app was failing to build with a syntax error in `DistanceCalculator.ts` at line 107:

```
ERROR SyntaxError: /Users/AjeetKumar/Desktop/mg-mart/apps/grocery-app/src/services/location/DistanceCalculator.ts:
Unexpected token (107:15)

105 |
106 | // Round to 3 decimal places for precision
> 107 | return Math.round(distance * 1000) / 1000;
| ^
108 | }
```

## Root Cause
The `calculateDistance` method had duplicate and malformed code due to an incomplete string replacement. The method
contained:

1. **Duplicate return statements**
2. **Duplicate error handling code**
3. **Broken method structure**

### Problematic Code:
```typescript
// Round to 3 decimal places for precision
const finalDistance = Math.round(distance * 1000) / 1000;

console.log(`✅ Distance calculated: ${finalDistance}km`);
return finalDistance;
throw new Error('Distance calculation failed - result is NaN'); // ❌ Unreachable code
}

// Round to 3 decimal places for precision
return Math.round(distance * 1000) / 1000; // ❌ Duplicate code outside method
}
```

## Solution
Cleaned up the `calculateDistance` method by:

1. **Removing duplicate code**
2. **Fixing method structure**
3. **Ensuring proper closing braces**

### Fixed Code:
```typescript
// Distance in kilometers
const distance = DistanceCalculator.EARTH_RADIUS_KM * c;

// Check for NaN result
if (isNaN(distance)) {
console.error('❌ Distance calculation resulted in NaN:', {
point1,
point2,
lat1Rad,
lat2Rad,
deltaLatRad,
deltaLonRad,
a,
c,
earthRadius: DistanceCalculator.EARTH_RADIUS_KM
});
throw new Error('Distance calculation failed - result is NaN');
}

// Round to 3 decimal places for precision
const finalDistance = Math.round(distance * 1000) / 1000;

console.log(`✅ Distance calculated: ${finalDistance}km`);
return finalDistance;
} // ✅ Proper method closing

/**
* Next method starts here...
*/
isWithinServiceArea(
```

## Verification
- ✅ Syntax error resolved
- ✅ All location service files pass diagnostics
- ✅ Method structure is correct
- ✅ Debug logging preserved
- ✅ Error handling intact

## Files Fixed
- `apps/grocery-app/src/services/location/DistanceCalculator.ts`

The app should now build and run successfully. The location validation system will work with proper distance
calculations and debug logging.