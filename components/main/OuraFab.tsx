import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type Props = {
  onPress: () => void;
  bottom?: number;
  style?: ViewStyle;
};

export const OuraFab = ({ onPress, bottom = 20, style }: Props) => {
  const anim = useRef(new Animated.Value(0)).current;
  const AnimatedTouchableOpacity = useMemo(
    () => Animated.createAnimatedComponent(TouchableOpacity),
    []
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.ouraFab,
        { bottom },
        { transform: [{ translateY }, { scale }] },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={require("@/assets/images/oura.png")}
        style={styles.ouraFabImage}
        resizeMode="cover"
      />
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ouraFab: {
    position: "absolute",
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 50,
    overflow: "hidden",
  },
  ouraFabImage: {
    width: "100%",
    height: "100%",
  },
});


