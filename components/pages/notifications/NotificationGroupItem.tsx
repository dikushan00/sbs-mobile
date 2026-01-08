import { Icon, IconKeysType } from "@/components/Icon";
import { COLORS, FONT } from "@/constants";
import { MobileNotifyGroupCodeType } from "@/services/types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  getGroupLatestTime,
  getGroupNotifyCount,
  getGroupLatestTitle,
  NOTIFICATION_GROUPS,
  NotificationsResponse,
} from "./services";
import { useMemo } from "react";

type PropsType = {
  group: NotificationsResponse;
  onPress?: (groupCode: MobileNotifyGroupCodeType) => void;
  isLast?: boolean;
};

export const NotificationGroupItem = ({ group, onPress, isLast }: PropsType) => {
  const groupInfo = NOTIFICATION_GROUPS[group.mobile_notify_group_code];
  const latestTime = getGroupLatestTime(group);
  const latestTitle = getGroupLatestTitle(group);
  const notifyCount = getGroupNotifyCount(group);

  if (!groupInfo || notifyCount === 0) return null;

  const iconName = groupInfo.icon as IconKeysType;

  const handlePress = () => {
    onPress?.(group.mobile_notify_group_code);
  };

  const countUnRead = useMemo(() => {
    return group.day_list?.reduce((acc, day) => {
      return acc + (day.notify_list?.filter((notify) => !notify.is_read).length || 0);
    }, 0) || 0;
  }, [group]);

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconWrapper}>
            <Icon name={iconName} width={18} height={18} fill={COLORS.primarySecondary} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.title}>{groupInfo.title}</Text>
            {latestTitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {latestTitle}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.time}>{latestTime}</Text>
          {countUnRead > 0 && (
            <View style={styles.unReadCount}>
              <Text style={styles.unReadCountText}>{countUnRead}</Text>
            </View>
          )}
        </View>
      </Pressable>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  pressed: {
    backgroundColor: '#f5f5f5',
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    gap: 2,
    flexShrink: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  rightContent: {
    alignItems: "flex-end",
    gap: 4,
  },
  time: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.darkGray,
  },
  divider: {
    height: 0.5,
    backgroundColor: "#E0E0E0",
    marginLeft: 56,
    marginRight: 16,
  },
  unReadCount: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primarySecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  unReadCountText: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: COLORS.white,
  },
});

