import { COLORS } from "@/constants";
import { FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export const SyncData = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <FontAwesome5 name="sync-alt" size={35} color={COLORS.primary} />
        </Animated.View>
        <Text style={styles.text}>Синхронизация данных</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#fff",
    width: 300,
    flexDirection: "column",
    alignItems: "center",
    padding: 25,
    borderRadius: 10,
  },
  text: { marginTop: 15, fontSize: 18 },
});
