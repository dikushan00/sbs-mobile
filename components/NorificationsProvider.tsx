import { PAGE_NAMES, PageNameKeysType } from "@/constants";
import { registerForPushNotificationsAsync } from "@/services";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export const NotificationsProvider = () => {
  const navigation = useNavigation();
  const [, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>(null);
  const responseListener = useRef<Notifications.Subscription>(null);

  const goToPage = (page: PageNameKeysType | string, params = {}) => {
    let targetPage = page;
    // Redirect 'project' to 'main' (project tab is handled inside MainPage)
    if (targetPage === 'project') {
      targetPage = 'main';
    }
    if (!targetPage || !PAGE_NAMES[targetPage as PageNameKeysType]) return;
    console.log(targetPage, params);
    navigation.navigate(
      //@ts-ignore
      targetPage as never,
      (params || {}) as never
    );
  };

  useEffect(() => {
    async function checkInitialNotification() {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response?.notification?.request?.content?.data) {
        const { page, params } = response.notification.request.content.data;
        goToPage(page as PageNameKeysType, params as any);
      }
    }
    checkInitialNotification();
    try {
      registerForPushNotificationsAsync();

      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          if (response?.notification?.request?.content?.data) {
            const { page, params } = response.notification.request.content.data;
            goToPage(page as PageNameKeysType, params as any);
          }
        });
    } catch (e) {}
    return () => {
      notificationListener.current && notificationListener.current.remove();
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      const { page, params } = data;
      goToPage(page, params);
    });
  
    return () => sub.remove();
  }, [navigation]);

  return null;
};
