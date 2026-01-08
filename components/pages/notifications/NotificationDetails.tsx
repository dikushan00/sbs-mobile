import { NotFound } from "@/components/common/NotFound";
import { COLORS, FONT, SHADOWS } from "@/constants";
import { useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Notification } from "./Notification";
import { NotificationsResponse, updateNotificationsRead } from "./services";
import { MobileNotifyGroupCodeType } from "@/services/types";
import { updateNotificationsCount } from "@/services/redux/reducers/app";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/services/redux";

type PropsType = {
  groupCode?: MobileNotifyGroupCodeType;
  groupData?: string;
};

export const NotificationDetails = ({ groupCode, groupData }: PropsType) => {
  const dispatch = useDispatch<AppDispatch>();
  const scrollViewRef = useRef<ScrollView>(null);

  const group: NotificationsResponse | null = useMemo(() => {
    if (!groupData) return null;
    try {
      return JSON.parse(groupData);
    } catch {
      return null;
    }
  }, [groupData]);

  useEffect(() => {
    const updateRead = async () => {
      if (groupCode && groupData) {
        const isUnReadExist = group?.day_list?.some(
          (day) => day.notify_list?.some((notify) => !notify.is_read)
        );
        if (isUnReadExist) {
          const res = await updateNotificationsRead(groupCode);
          if (res) {
            dispatch(updateNotificationsCount(res));
          }
        }
      }
    };
    updateRead();
  }, [groupCode, groupData]);

  // Скролл к низу при загрузке
  useEffect(() => {
    if ((group?.day_list?.length || 0) > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [group]);

  if (!group || !groupCode) {
    return <NotFound />;
  }

  const hasNotifications = group.day_list?.some(
    (day) => day.notify_list?.length > 0
  );

  if (!hasNotifications) {
    return <NotFound />;
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onContentSizeChange={() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }}
    >
      {group?.day_list?.map((dayItem) => (
        <View key={dayItem.day_date} style={styles.daySection}>
          <View style={styles.dateWrapper}>
            <Text style={styles.dateText}>
              {dayItem.day_date}
            </Text>
          </View>
          <View style={styles.notificationsList}>
            {dayItem.notify_list?.map((notify) => (
              <Notification
                key={String(notify.mobile_notify_id)}
                data={notify}
                groupCode={groupCode}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
    gap: 24,
  },
  daySection: {
    gap: 16,
  },
  dateWrapper: {
    alignSelf: "center",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dateText: {
    textAlign: "center",
    fontSize: 12,
    color: "#8f8f8f",
    fontFamily: FONT.medium,
  },
  notificationsList: {
    gap: 32,
  },
});

