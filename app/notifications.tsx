import { Notifications } from "@/components/pages/notifications";
import {
  getNotifications,
  NotificationsResponse,
} from "@/components/pages/notifications/services";
import { PageWrapper } from "@/components/PageWrapper";
import { setNotificationsCount } from "@/services/redux/reducers/app";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<NotificationsResponse[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const getData = async (controller?: AbortController) => {
    setIsFetching(true);
    const res = await getNotifications(controller?.signal);
    setIsFetching(false);
    setData(res || []);
    
    // Update notifications count in Redux
    if (res) {
      const totalCount = res.reduce((acc, item) => {
        return acc + (item.notify_list?.length || 0);
      }, 0);
      dispatch(setNotificationsCount(totalCount));
    }
  };

  const getDataCallback = useCallback(getData, []);
  return (
    <PageWrapper getData={getDataCallback}>
      <Notifications data={data} getData={getData} isFetching={isFetching} />
    </PageWrapper>
  );
};
export default NotificationsPage;
