import { COLORS } from "@/constants";
import { getWebViewUrl } from "@/services";
import {
  appState,
  closeWebViewMode,
  endWebViewModeLoading,
} from "@/services/redux/reducers/app";
import { userAppState } from "@/services/redux/reducers/userApp";
import React, { useRef } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { CustomLoader } from "../common/CustomLoader";
import { Icon } from "../Icon";

export const WebViewBlock = () => {
  const webViewRef = useRef(null);
  const dispatch = useDispatch();
  const { loginData } = useSelector(userAppState);
  const { webViewMode } = useSelector(appState);
  const insets = useSafeAreaInsets();

  const uri = webViewMode?.url ? webViewMode.url : loginData ? getWebViewUrl(loginData) : "";

  const onMessage = (e: WebViewMessageEvent) => {
    if (e.nativeEvent.data === "logout") dispatch(closeWebViewMode());
  };

  return (
    <SafeAreaView
      style={{
        height: "100%",
        flex: 1,
        backgroundColor: COLORS.lightWhite,
        paddingTop: Platform.OS === 'ios' ? 0 : -1 * insets.top,
      }}
    >
      {webViewMode.loading && <CustomLoader />}
      <View style={[styles.header, { backgroundColor: webViewMode.loading ? COLORS.backgroundWhite : '#162031' }]}>
        <TouchableOpacity
          onPress={() => dispatch(closeWebViewMode())}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" width={20} height={20} stroke={COLORS.black} />
        </TouchableOpacity>
      </View>
      <WebView
        ref={webViewRef}
        sharedCookiesEnabled={true}
        source={{
          uri,
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

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWhite,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
