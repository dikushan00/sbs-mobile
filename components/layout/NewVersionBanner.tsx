import { getAppLastVersion } from "@/services";
import { AntDesign } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Linking, Platform, View } from "react-native";
import { Banner } from "react-native-paper";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  appState,
  setShowNewVersionBanner,
} from "@/services/redux/reducers/app";
import { useInAppUpdatePrompt } from "@/utils/useInAppUpdatePrompt";
import { CustomLoader } from "../common/CustomLoader";

const appStoreUrl = "https://apps.apple.com/app/id6484272016";
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

  return (
    <View style={{ paddingTop: insets.top }}>
      {isDownloading && <CustomLoader />}
      <Banner
        visible={newVersionBannerShowed}
        actions={[
          {
            label: newVersionBannerShowed ? "Скачать" : "Обновить",
            onPress: newVersionBannerShowed ? redirectToStore : checkManually,
          },
        ]}
        icon={() => <AntDesign name="warning" size={24} color="orange" />}
      >
        {newVersionBannerShowed
          ? `Доступно новое обновление, перейдите в ${
              Platform.OS === "ios" ? "App Store" : "Play Store"
            }, чтобы скачать новую версию приложения.`
          : "Доступно новое обновление!"}
      </Banner>
    </View>
  );
};
