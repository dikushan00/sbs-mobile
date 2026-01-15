import { useRoute } from "@react-navigation/native";
import {
  StyleSheet,
  Pressable,
  View,
  Platform,
} from "react-native";
import { HeaderRight } from "./HeaderRight";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderTitle } from "./HeaderTitle";
import { Icon } from "../Icon";
import { useSelector } from "react-redux";
import { appState } from "@/services/redux/reducers/app";
import { useMemo } from "react";

export const PageHeader = ({
  navigation,
  params,
}: {
  navigation: any;
  params: any;
}) => {
  const { pageSettings, newVersionBannerShowed } = useSelector(appState);
  const route: { name?: string; params?: { withoutLayout?: boolean; backBtn?: boolean } } =
    useRoute();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (pageSettings.backBtn && pageSettings.goBack)
      return pageSettings.goBack();
    if (navigation.canGoBack()) navigation.goBack();
  };

  const isHomePage = route?.name === 'home' || route?.name === 'profile';

  const showBackBtn = useMemo(() => {
    if (isHomePage) return false;
    return (navigation.canGoBack() && route?.params?.backBtn !== false) || pageSettings.backBtn
  }, [navigation, route?.params?.backBtn, pageSettings.backBtn, isHomePage]);
  
  return (
    <View
      style={{
        ...styles.header,
        justifyContent: "space-between",
        position: "relative",
        paddingLeft: showBackBtn ? 5 : 15,
        paddingTop:
          Platform.OS === "ios" ? (newVersionBannerShowed ? 0 : insets.top) : 0,
      }}
    >
      {route?.params?.withoutLayout ? (
        <View />
      ) : (
        <View>
          {showBackBtn ? (
            <Pressable 
              onPress={handleBack} 
              style={({ pressed }) => [
                { 
                  paddingHorizontal: 20, 
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: pressed ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                }
              ]}
            >
              <Icon name="back" />
            </Pressable>
          ) : (
            <View style={{ width: 30, height: 32 }}></View> 
          )}
        </View>
      )}
      <View style={{...styles.centerTitleContainer, top: Platform.OS === "ios" ? insets.top - 10 : 0}}>
        <HeaderTitle title={params?.title} />
      </View>
      <HeaderRight />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    height: Platform.OS === "ios" ? "auto" : 56,
    paddingVertical: Platform.OS === "ios" ? 10 : 0,
  },
  centerTitleContainer: {
    position: "absolute",
    left: 60,
    right: 60,
    top: Platform.OS === "ios" ? 30 : 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  headerText: {
    fontSize: Platform.OS === "ios" ? 30 : 24,
    fontWeight: "bold",
    marginRight: 12,
  },
});
