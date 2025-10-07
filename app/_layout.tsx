import { BottomDrawer } from "@/components/BottomDrawer";
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
  closeModal,
  initialize,
  setNetworkStatus,
} from "@/services/redux/reducers/app";
import { getMenuData, userAppState } from "@/services/redux/reducers/userApp";
import { Roboto_500Medium } from "@expo-google-fonts/dev";
import {
  Roboto_900Black as RobotoBlack,
  Roboto_700Bold as RobotoBold,
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
import React, { useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Provider, useDispatch, useSelector } from "react-redux";
import { AppDispatch, store } from "../services/redux";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <StatusBar
            backgroundColor={COLORS.background}
            barStyle={"dark-content"}
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
              <CustomModal />
            </SnackbarProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const exitTimeout = 2000;
export const Content = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [loaded, error] = useFonts({
    RobotoRegular,
    RobotoBold,
    RobotoBlack,
    RobotoThin,
    Roboto_500Medium,
    ...FontAwesome.font,
  });
  const { init, webViewMode, networkWasOff, modal, bottomDrawerData } =
    useSelector(appState);
  const { auth } = useSelector(userAppState);
  const lastBackPressed = useRef(0);
  const [offlineActionsLoading, setOfflineActionsLoading] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(true);

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
    if (init && auth) checkOfflineActions();
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
        if (modal.show) {
          dispatch(closeModal());
          return true;
        }
        if (bottomDrawerData.show) {
          dispatch(closeBottomDrawer());
          return true;
        }

        const currentTime = Date.now();
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        } else {
          if (currentTime - lastBackPressed.current <= exitTimeout) {
            BackHandler.exitApp();
            return false;
          } else {
            lastBackPressed.current = currentTime;
            Alert.prompt("Нажмите еще раз, чтобы выйти");
            return true;
          }
        }
      }
    );

    return () => {
      backHandler.remove();
    };
  }, [navigation, modal, bottomDrawerData]);

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
