import { COLORS, FONT } from "@/constants";
import { userAppState } from "@/services/redux/reducers/userApp";
import { cutString } from "@/utils";
import { useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, View, Platform} from "react-native";
import { useSelector } from "react-redux";

type PropsType = {
  title: any;
};
export const HeaderTitle = ({ title }: PropsType) => {
  const route: { params?: { withDesc?: boolean; dynamicTitle?: boolean } } =
    useRoute();
  const { pageHeaderData, isOkk } = useSelector(userAppState);

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
            fontFamily: isOkk ? FONT.bold : FONT.regular,
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
    minWidth: 190,
  },
  headerText: {
    fontFamily: Platform.OS === 'ios' ? FONT.semiBold : FONT.mediumRoboto,
    fontWeight: 600,
    fontSize: 16,
    textAlign: "center",
    color: COLORS.dark,
  },
  headerTextDesc: {
    fontFamily: FONT.regular,
    fontWeight: 400,
    fontSize: 12,
    lineHeight: 15,
  },
});
