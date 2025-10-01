import { Notifications } from "@/components/pages/notifications";
import {
  getNotifications,
  NotificationsResponse,
} from "@/components/pages/notifications/services";
import { PageWrapper } from "@/components/PageWrapper";
import React, { useCallback, useState } from "react";

const NotificationsPage = () => {
  const [data, setData] = useState<NotificationsResponse[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const getData = async (controller?: AbortController) => {
    setIsFetching(true);
    const res = await getNotifications(controller?.signal);
    setIsFetching(false);
    setData(res || []);
  };

  const getDataCallback = useCallback(getData, []);
  return (
    <PageWrapper getData={getDataCallback}>
      <Notifications data={data} getData={getData} isFetching={isFetching} />
    </PageWrapper>
  );
};
export default NotificationsPage;
