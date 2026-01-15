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
import { userAppState } from "@/services/redux/reducers/userApp";

export const FooterNav = () => {
  const navigation = useNavigation();
  const route: { name?: string } = useRoute();
  const insets = useSafeAreaInsets();
  const { hideFooterNav } = useSelector(appState);
  const { isOkk } = useSelector(userAppState);

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
        onPress={() => goTo(PAGE_NAMES.home)}
      >
        <Icon name="home"
          fill={isActive(PAGE_NAMES.home) ? COLORS.primary : "#D1D5DB"}
          width={20} height={20} />
        <Text
          style={[styles.label, isActive(PAGE_NAMES.home) && styles.activeText]}
        >
          Главная
        </Text>
      </TouchableOpacity>
      {isOkk && <TouchableOpacity
        style={styles.item}
        onPress={() => goTo(PAGE_NAMES.okk)}
      >
        <Icon name="checkCircleOutline"
          fill={isActive(PAGE_NAMES.okk) ? COLORS.primary : "#D1D5DB"}
          width={20} height={20} />
        <Text
          style={[
            styles.label,
            isActive(PAGE_NAMES.okk) && styles.activeText,
          ]}
        >
          OKK
        </Text>
      </TouchableOpacity>}
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
    backgroundColor: '#F9F9FA',
    // backgroundColor: 'rgba(249, 249, 250, 0.9)',
    paddingHorizontal: 10,
    justifyContent: "space-around",
    // Shadow: 0px -2px 10px 0px #0000000D
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Shadow for Android
    elevation: 8,
  },
  item: {
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 13,
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

