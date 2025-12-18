import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useCallback } from 'react';

const PRESS_IN_SCALE = 0.97;
const DURATION = 120;

export function usePressScale() {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(PRESS_IN_SCALE, { duration: DURATION });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: DURATION });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value < 1 ? 0.95 : 1,
  }));

  return { animatedStyle, handlePressIn, handlePressOut };
}

export default usePressScale;
