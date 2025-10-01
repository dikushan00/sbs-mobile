import { COLORS } from "@/constants";
import { getWebViewUrl } from "@/services";
import {
  appState,
  closeWebViewMode,
  endWebViewModeLoading,
} from "@/services/redux/reducers/app";
import { userAppState } from "@/services/redux/reducers/userApp";
import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { CustomLoader } from "../common/CustomLoader";

export const WebViewBlock = () => {
  const webViewRef = useRef(null);
  const dispatch = useDispatch();
  const { loginData } = useSelector(userAppState);
  const { webViewMode } = useSelector(appState);
  const insets = useSafeAreaInsets();

  const handleBackButton = () => {
    if (webViewRef.current) {
      //@ts-ignore
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButton);
    };
  }, []);

  const onMessage = (e: WebViewMessageEvent) => {
    if (e.nativeEvent.data === "logout") dispatch(closeWebViewMode());
  };

  return (
    <SafeAreaView
      style={{
        height: "100%",
        flex: 1,
        backgroundColor: COLORS.lightWhite,
        paddingTop: insets.top,
      }}
    >
      {webViewMode.loading && <CustomLoader />}
      <WebView
        ref={webViewRef}
        sharedCookiesEnabled={true}
        source={{
          uri: loginData ? getWebViewUrl(loginData) : "",
        }}
        onLoad={() => dispatch(endWebViewModeLoading())}
        setSupportMultipleWindows={false}
        javaScriptEnabled
        originWhitelist={["*"]}
        style={{ flex: 1, height: "100%", width: "100%" }}
        onMessage={onMessage}
      />
    </SafeAreaView>
  );
};
