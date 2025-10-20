import { useRoute } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { HeaderRight } from "./HeaderRight";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderTitle } from "./HeaderTitle";
import { Icon } from "../Icon";
import { useSelector } from "react-redux";
import { appState } from "@/services/redux/reducers/app";
import { userAppState } from "@/services/redux/reducers/userApp";

export const PageHeader = ({
  navigation,
  params,
}: {
  navigation: any;
  params: any;
}) => {
  const { pageSettings, newVersionBannerShowed } = useSelector(appState);
  const { isOkk } = useSelector(userAppState);
  const route: { params?: { withoutLayout?: boolean; backBtn?: boolean } } =
    useRoute();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (pageSettings.backBtn && pageSettings.goBack)
      return pageSettings.goBack();
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View
      style={{
        ...styles.header,
        justifyContent: "space-between",
        paddingTop:
          Platform.OS === "ios" ? (newVersionBannerShowed ? 0 : insets.top) : 0,
      }}
    >
      {route?.params?.withoutLayout ? (
        <View />
      ) : (
        <TouchableOpacity onPress={() => isOkk && navigation.openDrawer()}>
          {(navigation.canGoBack() && route?.params?.backBtn !== false) ||
          pageSettings.backBtn ? (
            <TouchableOpacity onPress={handleBack} style={{ padding: 10 }}>
              <Icon name="back" />
            </TouchableOpacity>
          ) : (
            isOkk 
              ? <Text style={styles.headerText}>☰</Text> 
              : <View style={{ width: 30, height: 32 }}></View> 
          )}
        </TouchableOpacity>
      )}
      <HeaderTitle title={params?.title} />
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
  headerText: {
    fontSize: Platform.OS === "ios" ? 30 : 24,
    fontWeight: "bold",
    marginRight: 12,
  },
});
