import { COLORS, FONT } from "@/constants";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontAwesome5 as Icon } from "@expo/vector-icons";

type PropsType = {
  children: any;
  title?: string;
  desc?: string;
  small?: boolean;
  icon?: string | null;
  style?: ViewStyle;
  renderRightContent?: () => any;
  renderIcon?: () => any;
};
export const BlockWrapper = ({
  children,
  title,
  desc,
  icon,
  small = false,
  renderRightContent,
  renderIcon,
  style = {},
}: PropsType) => {
  return (
    <View style={{ ...styles(small).wrapper, ...style }}>
      <View style={styles(small).header}>
        {!!title && (
          <View style={styles(small).titleWrapper}>
            {!!renderIcon && renderIcon()}
            {/* @ts-ignore */}
            {!!icon && <Icon name={icon} size={16} color={COLORS.primary} />}
            <Text style={{ ...styles(small).title }}>{title}</Text>
            {!!desc && <Text style={styles(small).desc}>{desc}</Text>}
          </View>
        )}
        {renderRightContent && renderRightContent()}
      </View>
      {children}
    </View>
  );
};

const styles = (small: boolean) =>
  StyleSheet.create({
    wrapper: {
      padding: 15,
      backgroundColor: "#fff",
      borderRadius: 12,
      width: "100%",
    },
    titleWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 5,
      width: "100%",
    },
    title: {
      fontFamily: small ? FONT.regular : FONT.bold,
      fontSize: small ? 14 : 19,
    },
    desc: {
      fontFamily: small ? FONT.regular : FONT.bold,
      fontSize: small ? 13 : 14,
      color: "#616161",
    },
    info: {
      gap: 1,
      marginTop: 8,
    },
    infoItem: {
      fontFamily: FONT.regular,
      fontSize: 14,
    },
    footer: {
      flexDirection: "row",
      gap: 10,
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
  });
