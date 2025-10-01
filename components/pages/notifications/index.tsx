import { CustomLoader } from "@/components/common/CustomLoader";
import { NotFound } from "@/components/common/NotFound";
import { FONT, SHADOWS } from "@/constants";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Notification } from "./Notification";
import { getNotifyDate, NotificationsResponse } from "./services";

type PropsType = {
  isFetching: boolean;
  data: NotificationsResponse[];
  getData: (controller?: AbortController) => void;
};
export const Notifications = ({ data, getData, isFetching }: PropsType) => {
  const scrollViewRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      getData(controller);
      return () => controller.abort();
    }, [])
  );

  useEffect(() => {
    if (scrollViewRef.current && data?.length)
      //@ts-ignore
      scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [scrollViewRef.current, data]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 25 }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={() => getData()} />
      }
      ref={scrollViewRef}
      onContentSizeChange={() => {
        // Scroll to bottom whenever the content size changes
        //@ts-ignore
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }}
    >
      {isFetching && <CustomLoader />}
      <View style={styles.notificationsWrapper}>
        {data?.length
          ? data.map((item) => {
              return (
                <View key={item.day_date}>
                  <View style={styles.date}>
                    <View style={styles.dateTextWrapper}>
                      <Text style={styles.dateText}>
                        {getNotifyDate(item.day_date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.notifications}>
                    {item.notify_list?.map((notify) => {
                      return (
                        <Notification
                          key={String(notify.mobile_notify_id)}
                          data={notify}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })
          : !isFetching && <NotFound />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 10,
    height: "100%",
  },
  notificationsWrapper: {
    gap: 15,
  },
  notifications: {
    gap: 15,
  },
  date: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  dateTextWrapper: {
    backgroundColor: "#edf4ff",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    ...SHADOWS.small,
  },
  dateText: {
    textAlign: "center",
    fontSize: 12,
    color: "#8f8f8f",
    fontFamily: FONT.medium,
  },
});
