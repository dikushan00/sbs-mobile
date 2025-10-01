import { COLORS, FONT } from "@/constants";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontAwesome5 as Icon } from "@expo/vector-icons";

export const InfoBlock = ({
  children,
  style = {},
}: {
  children: any;
  style?: ViewStyle;
}) => {
  return <View style={{ ...styles.info, ...style }}>{children}</View>;
};

type InfoItemProps = {
  children: any;
  icon?: string;
  textChildren?: boolean;
};
export const InfoItem = ({
  children,
  icon,
  textChildren = true,
}: InfoItemProps) => {
  if (icon)
    return (
      <View style={styles.infoItemWrapper}>
        {/* @ts-ignore */}
        <Icon
          style={{ width: 20 }}
          name={icon}
          size={16}
          color={COLORS.primary}
        />
        {textChildren ? (
          <Text style={styles.infoItem}>{children}</Text>
        ) : (
          children
        )}
      </View>
    );
  return <Text style={styles.infoItem}>{children}</Text>;
};
const styles = StyleSheet.create({
  info: {
    gap: 4,
    marginTop: 8,
  },
  infoItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
    width: "100%",
  },
  infoItem: {
    fontFamily: FONT.regular,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
  },
});
