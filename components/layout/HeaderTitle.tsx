import { FONT } from "@/constants";
import { userAppState } from "@/services/redux/reducers/userApp";
import { cutString } from "@/utils";
import { useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

type PropsType = {
  title: any;
};
export const HeaderTitle = ({ title }: PropsType) => {
  const route: { params?: { withDesc?: boolean; dynamicTitle?: boolean } } =
    useRoute();
  const { pageHeaderData } = useSelector(userAppState);

  const showTitle = useMemo(() => {
    if (route.params?.dynamicTitle) {
      return !!pageHeaderData?.title;
    }
    return !!title;
  }, [route.params?.dynamicTitle, pageHeaderData, title]);

  return (
    <View style={styles.headerContainer}>
      {showTitle && (
        <Text style={styles.headerText}>
          {cutString(
            route.params?.dynamicTitle ? pageHeaderData?.title || "" : title
          )}
        </Text>
      )}
      {route.params?.withDesc && !!pageHeaderData.desc && (
        <Text
          style={{
            ...styles.headerTextDesc,
            color: pageHeaderData.descColor || "#404040",
            width: "85%",
            textAlign: "center",
          }}
        >
          {pageHeaderData.desc}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
  },
  headerText: {
    fontFamily: FONT.bold,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    color: "#404040",
  },
  headerTextDesc: {
    fontFamily: FONT.bold,
    fontSize: 12,
    lineHeight: 15,
  },
});
