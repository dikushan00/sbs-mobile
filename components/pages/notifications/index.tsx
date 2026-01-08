import { CustomLoader } from "@/components/common/CustomLoader";
import { NotFound } from "@/components/common/NotFound";
import { COLORS, PAGE_NAMES } from "@/constants";
import { MobileNotifyGroupCodeType } from "@/services/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { NotificationGroupItem } from "./NotificationGroupItem";
import {
  getGroupNotifyCount,
  NOTIFICATION_GROUPS,
  NotificationsResponse,
} from "./services";

type PropsType = {
  isFetching: boolean;
  data: NotificationsResponse[];
  getData: (controller?: AbortController) => void;
};

export const Notifications = ({ data, getData, isFetching }: PropsType) => {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      getData(controller);
      return () => controller.abort();
    }, [])
  );

  // Фильтруем только группы с уведомлениями
  const groupsWithNotifications = data?.filter(
    (group) => getGroupNotifyCount(group) > 0
  );

  const handleGroupPress = (groupCode: MobileNotifyGroupCodeType) => {
    const selectedGroup = data?.find(
      (group) => group.mobile_notify_group_code === groupCode
    );
    if (selectedGroup) {
      const groupInfo = NOTIFICATION_GROUPS[groupCode];
      navigation.navigate(
        // @ts-ignore
        PAGE_NAMES.notificationDetails as never,
        {
          groupCode,
          groupData: JSON.stringify(selectedGroup),
          title: groupInfo?.title || "Уведомления",
        } as never
      );
    }
  };
  return (
    <>
      {isFetching && <CustomLoader />}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={() => getData()} />
        }
      >
        {groupsWithNotifications?.length ? (
          <View style={styles.groupsWrapper}>
            {groupsWithNotifications.map((group, index) => (
              <NotificationGroupItem
                key={group.mobile_notify_group_code}
                group={group}
                onPress={handleGroupPress}
                isLast={index === groupsWithNotifications.length - 1}
              />
            ))}
          </View>
        ) : (
          !isFetching && <NotFound />
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 25,
  },
  groupsWrapper: {
    backgroundColor: COLORS.backgroundWhite,
    borderRadius: 16,
    shadowColor: "#ccc",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
});
