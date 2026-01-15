import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { COLORS, FONT, SIZES } from "@/constants";
import { Icon } from "@/components/Icon";

type PlacementBadgesVariant = "badge" | "tag";

type Props = {
  floor?: string | number | null;
  blockName?: string | null;
  placementTypeName?: string | null;
  variant?: PlacementBadgesVariant;
  iconFill?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const PlacementBadges: React.FC<Props> = ({
  floor,
  blockName,
  placementTypeName,
  variant = "tag",
  iconFill = "#242424",
  containerStyle,
  textStyle,
}) => {
  const isBadge = variant === "badge";
  const iconSize = isBadge ? 14 : 12;

  return (
    <View style={[isBadge ? styles.badgeContainer : styles.tagContainer, containerStyle]}>
      <View style={styles.item}>
        <Icon name="plan" width={iconSize} height={iconSize} fill={iconFill} />
        <Text style={[isBadge ? styles.badgeText : styles.tagText, textStyle]}>
          {floor ?? "-"}
        </Text>
      </View>
      <View style={styles.item}>
        <Icon name="residentCloud" width={iconSize} height={iconSize} fill={iconFill} />
        <Text style={[isBadge ? styles.badgeText : styles.tagText, textStyle]}>
          {blockName ?? "-"}
        </Text>
      </View>
      <View style={styles.item}>
        <Icon name="apartment" width={iconSize} height={iconSize} fill={iconFill} />
        <Text style={[isBadge ? styles.badgeText : styles.tagText, textStyle]}>
          {placementTypeName ?? "-"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  tagText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
});


