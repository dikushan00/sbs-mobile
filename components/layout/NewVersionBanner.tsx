import { getAppLastVersion } from "@/services";
import { COLORS, SHADOWS, SIZES, FONT } from "@/constants";
import { AntDesign } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  appState,
  setShowNewVersionBanner,
} from "@/services/redux/reducers/app";
import { useInAppUpdatePrompt } from "@/utils/useInAppUpdatePrompt";
import { CustomLoader } from "../common/CustomLoader";

const appStoreUrl = "https://apps.apple.com/app/id6755104471";
const playStoreUrl =
  "https://play.google.com/store/apps/details?id=kz.smartremont.sbs";

export const NewVersionBanner = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { newVersionBannerShowed } = useSelector(appState);
  const { isDownloading, isUpdateAvailable, checkManually } =
    useInAppUpdatePrompt();

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const localVersion = Constants.expoConfig?.version || "";
        const res = await getAppLastVersion();
        if (!res) return;
        const latestVersion = res.version_name;

        if (localVersion && compareVersions(latestVersion, localVersion) > 0) {
          if (!__DEV__) {
            dispatch(setShowNewVersionBanner(true));
          }
        }
      } catch (e) {}
    };

    checkVersion();
  }, []);

  const compareVersions = (v1: string, v2: string) => {
    const a = v1.split(".").map(Number);
    const b = v2.split(".").map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const diff = (a[i] || 0) - (b[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  };

  const redirectToStore = useCallback(() => {
    const storeUrl = Platform.OS === "ios" ? appStoreUrl : playStoreUrl;

    Linking.openURL(storeUrl).catch((err) =>
      console.error("Failed to open store:", err)
    );
  }, []);

  if (!newVersionBannerShowed && !isUpdateAvailable) return null;

  const visible = newVersionBannerShowed || isUpdateAvailable;
  const actionLabel = newVersionBannerShowed ? "Скачать" : "Обновить";
  const storeName = Platform.OS === "ios" ? "App Store" : "Play Store";
  const description = newVersionBannerShowed
    ? `Доступна новая версия. Перейдите в ${storeName}, чтобы скачать обновление.`
    : "Доступно новое обновление!";

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: COLORS.backgroundWhite }} pointerEvents={visible ? "auto" : "none"}>
      {isDownloading && <CustomLoader />}
      <View style={[styles.card, !visible && styles.hidden]}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <AntDesign name="warning" size={20} color={COLORS.tertiary} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>Доступно обновление</Text>
            <Text style={styles.subtitle}>{description}</Text>
          </View>

          <TouchableOpacity
            onPress={newVersionBannerShowed ? redirectToStore : checkManually}
            activeOpacity={0.85}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#FFF7ED",
    borderColor: "rgba(255, 119, 84, 0.25)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    ...SHADOWS.small,
  },
  hidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    padding: 0,
    borderWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 119, 84, 0.12)",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily: FONT.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    lineHeight: 16,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  actionBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
});
