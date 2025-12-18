import React from 'react';
import { Pressable } from 'react-native';
import Animated, { createAnimatedComponent } from 'react-native-reanimated';
import usePressScale from '../animations/usePressScale';

const AnimatedPressableBase = createAnimatedComponent(Pressable);

export default function AnimatedPressable({ children, style, onPress, ...rest }) {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressScale();

  return (
    <AnimatedPressableBase
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(e) => { handlePressIn(); rest?.onPressIn?.(e); }}
      onPressOut={(e) => { handlePressOut(); rest?.onPressOut?.(e); }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressableBase>
  );
}
