# Animation Demo Guide

## Quick Test Scenarios

### Scenario 1: First Add Animation
**Steps:**
1. Open Home screen or Products screen
2. Find a product with "ADD" button
3. Tap "ADD"

**Expected Behavior:**
- Button scales down slightly (tactile feedback)
- Button expands smoothly into `[- 1 +]` stepper
- Cart badge in tab bar bounces (1 → 1.3 → 1)
- All animations complete in ~250ms

### Scenario 2: Increase Quantity
**Steps:**
1. Find a product already in cart (showing stepper)
2. Tap "+" button

**Expected Behavior:**
- Quantity increments instantly
- Cart badge bounces
- No expansion animation (already expanded)

### Scenario 3: Decrease to Zero
**Steps:**
1. Find a product with quantity = 1
2. Tap "-" button (shows trash icon)

**Expected Behavior:**
- Stepper collapses smoothly
- Fades out with opacity animation
- "ADD" button reappears
- Cart badge updates (no bounce on decrease)

### Scenario 4: Multiple Products
**Steps:**
1. Add multiple products in quick succession
2. Observe cart badge

**Expected Behavior:**
- Each add triggers badge bounce
- Animations queue smoothly
- No animation conflicts
- Badge count updates correctly

## Visual Indicators

### Animation States

```
State 1: Not in Cart
┌─────────┐
│ ADD │ ← Static button
└─────────┘

State 2: Adding (Animation)
┌─────────┐ ┌──────────┐
│ ADD │ --> │ [-] 1 [+]│ ← Expanding
└─────────┘ └──────────┘
↓
Scale 0.95 → 1.0
Width expanding
Opacity fading in

State 3: In Cart
┌──────────┐
│ [-] 2 [+]│ ← Fully expanded stepper
└──────────┘

State 4: Removing (Animation)
┌──────────┐ ┌─────────┐
│ [-] 1 [+]│ --> │ ADD │ ← Collapsing
└──────────┘ └─────────┘
↓
Width collapsing
Opacity fading out
```

### Badge Animation

```
Normal State: Bounce State: Back to Normal:
┌─┐ ┌───┐ ┌─┐
│1│ --> │ 2 │ --> │2│
└─┘ └───┘ └─┘
Scale 1.0 Scale 1.3 Scale 1.0
(150ms) (spring)
```

## Performance Metrics

### Target Performance
- Animation FPS: 60fps
- Add animation duration: 250ms
- Remove animation duration: 200ms
- Badge bounce duration: ~300ms (spring)

### Monitoring
Watch for:
- Smooth transitions (no jank)
- Consistent timing across devices
- No layout shifts
- Proper z-index layering

## Common Issues & Solutions

### Issue 1: Animation Stuttering
**Cause:** Too many animations running simultaneously
**Solution:** Animations use native driver where possible

### Issue 2: Badge Not Bouncing
**Cause:** Count decreased instead of increased
**Solution:** Badge only bounces on increment (by design)

### Issue 3: Stepper Not Expanding
**Cause:** Product out of stock
**Solution:** Out of stock products show "Out of Stock" badge

### Issue 4: Animation Delay
**Cause:** JS thread busy
**Solution:** Animations use native driver for transform/opacity

## Device Testing

### iOS
- Test on iPhone SE (low-end)
- Test on iPhone 14 Pro (high-end)
- Check safe area handling
- Verify haptic feedback

### Android
- Test on Android 10+ devices
- Check different screen densities
- Verify animation smoothness
- Test on low-end devices

## Animation Timing Reference

```javascript
// Button Press
Duration: 200ms total
- Down: 100ms (scale 1 → 0.95)
- Up: 100ms (scale 0.95 → 1)

// Expansion (Add → Stepper)
Duration: 250ms
- Width: 250ms (interpolated)
- Opacity: 200ms (0 → 1)

// Collapse (Stepper → Add)
Duration: 200ms
- Width: 200ms (interpolated)
- Opacity: 150ms (1 → 0)

// Badge Bounce
Duration: ~300ms (spring)
- Scale up: 150ms (1 → 1.3)
- Spring back: ~150ms (1.3 → 1)
- Friction: 3
- Tension: 100
```

## Debugging Tips

### Enable Animation Debugging
```javascript
// In CartQuantityStepper.tsx, add:
console.log('Animation triggered:', { quantity, cartItem });

// In AnimatedCartBadge.tsx, add:
console.log('Badge bounce:', { count, prevCount: prevCountRef.current });
```

### Check Animation Values
```javascript
// Monitor animation progress
scaleAnim.addListener((value) => {
console.log('Scale:', value);
});
```

### Performance Profiling
1. Open React Native Debugger
2. Enable "Show Perf Monitor"
3. Watch JS frame rate during animations
4. Target: 60fps consistently

## User Feedback

### Positive Indicators
- Users add items quickly without hesitation
- No confusion about cart state
- Smooth, polished feel
- Instant visual feedback

### Negative Indicators
- Users wait for animations to complete
- Confusion about whether item was added
- Complaints about lag or stuttering
- Accidental double-taps

## Accessibility Considerations

### Reduced Motion
- Animations respect system preferences
- Fallback to instant state changes
- No essential information lost

### Screen Readers
- Announce cart updates
- Describe button state changes
- Provide audio feedback

## Next Steps

1. Test on real devices (iOS + Android)
2. Gather user feedback on animation speed
3. Monitor performance metrics
4. Consider A/B testing animation variants
5. Optimize based on device capabilities

## Success Criteria

✅ Animations run at 60fps
✅ No jank or stuttering
✅ Instant user feedback
✅ Smooth state transitions
✅ Badge updates correctly
✅ Works on low-end devices
✅ Accessible to all users
✅ Enhances UX without blocking