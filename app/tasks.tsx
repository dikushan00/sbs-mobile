import { WorkStatusesKeyType } from "@/components/pages/remonts/services";
import { WorkType } from "@/components/pages/remonts/types";
import { Tasks } from "@/components/pages/tasks";
import { getTasks } from "@/components/pages/tasks/services";
import { PageWrapper } from "@/components/PageWrapper";
import React, { useCallback, useState } from "react";

type PropsType = {
  route: { params: { status: WorkStatusesKeyType } };
};
const TasksPage = ({ route }: PropsType) => {
  const { status } = route.params;
  const [data, setData] = useState<WorkType[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const getData = async (controller?: AbortController) => {
    if (!status) return;
    setIsFetching(true);
    const res = await getTasks(status, controller?.signal);
    setIsFetching(false);
    setData(res || []);
  };
  const getDataCallback = useCallback(getData, [status]);
  return (
    <PageWrapper getData={getDataCallback}>
      <Tasks
        status={status}
        data={data}
        setData={setData}
        getData={getData}
        isFetching={isFetching}
      />
    </PageWrapper>
  );
};
export default TasksPage;
