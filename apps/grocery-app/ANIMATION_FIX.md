# Animation Fix - Native Driver Issue

## Problem
Two errors were occurring:
1. **"Style property 'width' is not supported by native animated module"**
2. **"Attempting to run JS driven animation on animated node that has been moved to 'native'"**

## Root Cause
Mixed use of `useNativeDriver: true` and `useNativeDriver: false` in parallel animations caused conflicts. The `width`
property cannot use native driver, but `opacity` was set to use it, creating an inconsistency.

## Solution

### Changed in `CartQuantityStepper.tsx`

#### Before (Broken)
```javascript
Animated.parallel([
Animated.timing(widthAnim, {
toValue: 1,
duration: 250,
useNativeDriver: false, // Width cannot use native
}),
Animated.timing(opacityAnim, {
toValue: 1,
duration: 200,
useNativeDriver: true, // ❌ Conflict!
}),
]).start();
```

#### After (Fixed)
```javascript
Animated.parallel([
Animated.timing(widthAnim, {
toValue: 1,
duration: 250,
useNativeDriver: false, // Width cannot use native
}),
Animated.timing(opacityAnim, {
toValue: 1,
duration: 200,
useNativeDriver: false, // ✅ Must match widthAnim
}),
]).start();
```

### Structure Fix
Also fixed the nested `Animated.View` structure to properly separate width/opacity animation from scale animation:

```javascript
// Outer wrapper: handles width + opacity (JS thread)
<Animated.View style={{ width: stepperWidth, opacity: opacityAnim, }}>
    {/* Inner wrapper: handles scale (native thread) */}
    <Animated.View style={[ styles.stepperContainer, { transform: [{ scale: scaleAnim }], }, ]}>
        {/* Stepper content */}
    </Animated.View>
</Animated.View>
```

## Key Learnings

### Native Driver Limitations
- ✅ **Can use native driver**: `transform`, `opacity` (when standalone)
- ❌ **Cannot use native driver**: `width`, `height`, `top`, `left`, layout properties

### Parallel Animations Rule
When running parallel animations:
- All animations in the same `Animated.parallel()` must use the **same driver type**
- If one animation needs `useNativeDriver: false`, all must use `false`

### Nested Animations
To mix native and JS animations:
- Use separate `Animated.View` wrappers
- Outer wrapper: JS-driven animations (width, height)
- Inner wrapper: Native-driven animations (transform, standalone opacity)

## Performance Impact

### Before Fix
- ❌ Crashes with render error
- ❌ Animations don't run

### After Fix
- ✅ Animations run smoothly
- ⚠️ Width/opacity on JS thread (~60fps on most devices)
- ✅ Scale animation still on native thread (60fps guaranteed)
- ✅ No visual jank on modern devices

## Testing Checklist
- [x] No console errors
- [x] No render errors
- [x] Add button scales correctly
- [x] Stepper expands smoothly
- [x] Stepper collapses smoothly
- [x] Badge bounces correctly
- [x] Works on iOS
- [x] Works on Android

## Alternative Approaches (Not Used)

### Option 1: All Native Driver
```javascript
// Would require removing width animation entirely
// Not ideal for this use case
```

### Option 2: LayoutAnimation
```javascript
// Could use LayoutAnimation.configureNext()
// Less control over timing and easing
```

### Option 3: Reanimated 2
```javascript
// Would allow native width animations
// Requires additional dependency
// Overkill for this use case
```

## Conclusion
The fix maintains smooth animations while respecting React Native's native driver limitations. The slight performance
trade-off (width/opacity on JS thread) is acceptable for this use case and provides a better user experience than no
animation at all.