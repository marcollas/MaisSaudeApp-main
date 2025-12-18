import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from './AnimatedPressable';

export default function AnimatedAccordion({ title, children, defaultOpen = false, style }) {
  const [contentHeight, setContentHeight] = useState(0);
  const [open, setOpen] = useState(defaultOpen);
  const height = useSharedValue(0);
  const rotate = useSharedValue(defaultOpen ? 1 : 0);

  useEffect(() => {
    height.value = withTiming(open ? contentHeight : 0, { duration: 220 });
    rotate.value = withTiming(open ? 1 : 0, { duration: 220 });
  }, [open, contentHeight, height, rotate]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: contentHeight === 0 ? 0 : height.value / Math.max(contentHeight, 1),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotate.value, [0, 1], [0, 180])}deg` }],
  }));

  return (
    <View style={[styles.container, style]}>
      <AnimatedPressable style={styles.header} onPress={() => setOpen((p) => !p)}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={iconStyle}>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </Animated.View>
      </AnimatedPressable>

      <Animated.View style={[styles.body, bodyStyle]}>
        <View
          style={styles.content}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h !== contentHeight) setContentHeight(h);
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  body: {
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
  },
});
