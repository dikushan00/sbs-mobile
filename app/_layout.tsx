import { BottomDrawer } from "@/components/BottomDrawer";
import { SecondBottomDrawer } from "@/components/SecondBottomDrawer";
import { CustomModal } from "@/components/Modal";
import { NotificationsProvider } from "@/components/NorificationsProvider";
import { CustomLoader } from "@/components/common/CustomLoader";
import { NavigationBlock } from "@/components/layout/NavigationBlock";
import { NewVersionBanner } from "@/components/layout/NewVersionBanner";
import { SnackbarProvider } from "@/components/snackbar/SnackbarContext";
import { WebViewBlock } from "@/components/webView";
import { COLORS } from "@/constants";
import { doOfflineActions } from "@/services";
import {
  appState,
  closeBottomDrawer,
  closeSecondBottomDrawer,
  closeModal,
  initialize,
  setNetworkStatus,
  showModal,
  fetchNotificationsCount,
  closeWebViewMode,
} from "@/services/redux/reducers/app";
import { getMenuData, userAppState } from "@/services/redux/reducers/userApp";
import { Roboto_500Medium } from "@expo-google-fonts/dev";
import {
  Roboto_900Black as RobotoBlack,
  Roboto_700Bold as RobotoBold,
  Roboto_500Medium as RobotoMedium,
  Roboto_400Regular as RobotoRegular,
  Roboto_100Thin as RobotoThin,
} from "@expo-google-fonts/roboto";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import NetInfo from "@react-native-community/netinfo";
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigation,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { BackHandler, Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Provider, useDispatch, useSelector } from "react-redux";
import { AppDispatch, store } from "../services/redux";
import { useDeepLinking } from "@/utils/useDeepLinking";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <StatusBar
            backgroundColor={'#FFF'}
            barStyle="dark-content"
            translucent={false}
          />
          <SafeAreaProvider
            style={{ paddingTop: Platform.OS === "ios" ? 0 : insets.top }}
          >
            <SnackbarProvider>
              <NavigationIndependentTree>
                <NewVersionBanner />
                <NavigationContainer>
                  <Content />
                  <NotificationsProvider />
                </NavigationContainer>
              </NavigationIndependentTree>
              <BottomDrawer />
              <SecondBottomDrawer />
              <CustomModal />
            </SnackbarProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export const Content = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [loaded, error] = useFonts({
    RobotoRegular,
    RobotoBold,
    RobotoBlack,
    RobotoThin,
    Roboto_500Medium,
    RobotoMedium,
    ...FontAwesome.font,
  });
  const { init, webViewMode, networkWasOff, modal, bottomDrawerData, secondBottomDrawerData, pageSettings } =
    useSelector(appState);
  const { auth } = useSelector(userAppState);
  const [offlineActionsLoading, setOfflineActionsLoading] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(true);
  
  // Инициализация deep linking
  useDeepLinking();

  const checkOfflineActions = async () => {
    if (offlineActionsLoading) return;
    setOfflineActionsLoading(true);
    await doOfflineActions(dispatch);
    setOfflineActionsLoading(false);
    dispatch(getMenuData());
  };

  useEffect(() => {
    dispatch(initialize());
  }, []);

  useEffect(() => {
    if (init && auth) {
      checkOfflineActions();
      dispatch(fetchNotificationsCount());
    }
  }, [init, auth]);

  useEffect(() => {
    if (networkWasOff && networkConnected) {
      checkOfflineActions();
    }
  }, [networkWasOff, networkConnected]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkConnected(!!state.isConnected);
      if (!state.isConnected) {
        dispatch(setNetworkStatus(true));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {

        if (webViewMode.active) {
          dispatch(closeWebViewMode())
          return true;
        }

        // Затем проверяем модалку
        if (modal.show) {
          dispatch(closeModal());
          return true;
        }

        // Затем проверяем второй bottom drawer
        if (secondBottomDrawerData.show) {
          dispatch(closeSecondBottomDrawer());
          return true;
        }

        // Затем проверяем первый bottom drawer
        if (bottomDrawerData.show) {
          dispatch(closeBottomDrawer());
          return true;
        }
        // Сначала проверяем goBack из pageSettings
        if (pageSettings.goBack) {
          pageSettings.goBack();
          return true;
        }

        // Затем проверяем навигацию
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        } else {
          // В конце показываем модалку подтверждения выхода
          dispatch(showModal({ type: "exitConfirm", data: { close: false } }));
          return true;
        }
      }
    );

    return () => {
      backHandler.remove();
    };
  }, [navigation, modal, bottomDrawerData, secondBottomDrawerData, pageSettings, webViewMode]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!init || !loaded)
    return (
      <SafeAreaView>
        <CustomLoader />
      </SafeAreaView>
    );

  return <>{webViewMode.active ? <WebViewBlock /> : <NavigationBlock />}</>;
};
