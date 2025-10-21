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
import { useSelector } from "react-redux";
import { appState } from "@/services/redux/reducers/app";
import { Icon } from "../Icon";

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
        <Icon name="documentAlt"
          fill={isActive(PAGE_NAMES.main) ? COLORS.primary : "#D1D5DB"}
          width={20} height={20} />
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
        <Icon name="profile"
          fill={isActive(PAGE_NAMES.profile) ? COLORS.primary : "#D1D5DB"}
          width={20} height={20} />
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
    borderTopColor: "rgba(0, 0, 0, .15)",
    backgroundColor: '#F9F9FA',
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
    color: "#9CA3AF",
  },
  activeText: {
    color: COLORS.primary,
  },
});

