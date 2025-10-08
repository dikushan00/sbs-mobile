import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, PAGE_NAMES } from "@/constants";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { appState } from "@/services/redux/reducers/app";

export const FooterNav = () => {
  const navigation = useNavigation();
  const route: { name?: string } = useRoute();
  const insets = useSafeAreaInsets();
  const { hideFooterNav } = useSelector(appState);

  const goTo = (name: string) => {
    // @ts-ignore
    navigation.navigate(name);
  };

  const isActive = (name: string) => route?.name === name;

  if(hideFooterNav) return null
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom : insets.bottom,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() => goTo(PAGE_NAMES.main)}
      >
        <FontAwesome5
          name="tasks"
          size={20}
          color={isActive(PAGE_NAMES.main) ? COLORS.primary : "#666"}
        />
        <Text
          style={[styles.label, isActive(PAGE_NAMES.main) && styles.activeText]}
        >
          Проекты
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => goTo(PAGE_NAMES.profile)}
      >
        <FontAwesome5
          name="user"
          size={20}
          color={isActive(PAGE_NAMES.profile) ? COLORS.primary : "#666"}
        />
        <Text
          style={[
            styles.label,
            isActive(PAGE_NAMES.profile) && styles.activeText,
          ]}
        >
          Профиль
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingHorizontal: 20,
    justifyContent: "space-around",
  },
  item: {
    alignItems: "center",
    paddingVertical: 8,
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  activeText: {
    color: COLORS.primary,
  },
});

