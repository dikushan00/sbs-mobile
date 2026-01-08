import { NotificationDetails } from "@/components/pages/notifications/NotificationDetails";
import { PageWrapper } from "@/components/PageWrapper";
import { MobileNotifyGroupCodeType } from "@/services/types";
import { useRoute } from "@react-navigation/native";

type RouteParams = {
  groupCode: string;
  groupData: string; // JSON stringified group data
};

const NotificationDetailsPage = () => {
  const route = useRoute();
  const params = route.params as RouteParams;

  return (
    <PageWrapper getData={ async() => {}}>
      <NotificationDetails
        groupCode={params?.groupCode as MobileNotifyGroupCodeType}
        groupData={params?.groupData}
      />
    </PageWrapper>
  );
};

export default NotificationDetailsPage;

