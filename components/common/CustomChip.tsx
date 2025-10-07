import { FONT } from "@/constants";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontAwesome5 as Icon } from "@expo/vector-icons";

type PropsType = {
  backgroundColor?: string;
  textColor?: string;
  title: string;
  style?: ViewStyle;
  icon?: string;
};
export const CustomChip = ({
  title,
  backgroundColor,
  textColor,
  icon,
  style = {},
}: PropsType) => {
  return (
    <View
      style={{
        ...styles.wrapper,
        backgroundColor: backgroundColor || "#ddd",
        ...style,
      }}
    >
      {!!icon && <Icon name={icon} size={16} color={textColor} />}
      <Text style={{ ...styles.text, color: textColor || "#404040" }}>
        {title || ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    paddingVertical: 0,
    paddingHorizontal: 10,
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderRadius: 5,
    height: 24,
    backgroundColor: "#CEE7FF",
  },
  text: {
    fontFamily: FONT.bold,
    fontWeight: 600,
    fontSize: 14,
  },
});
