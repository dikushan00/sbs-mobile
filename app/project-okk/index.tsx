import { okkStatuses } from "@/components/pages/okk/services";
import { ProjectOkk } from "@/components/pages/projectOkk/ProjectOkk";
import { PageWrapper } from "@/components/PageWrapper";
import { getProjectOkkData } from "@/services/redux/reducers/userApp";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";

const ProjectOkkPage = () => {
  const dispatch = useDispatch();

  const getData = useCallback(
    async (controller?: AbortController) => {
      dispatch(
        getProjectOkkData(
          () => {},
          {
            signal: controller?.signal,
            params: { okk_status_code: okkStatuses.PROCESSING },
          },
          false
        ) as never
      );
    },
    [dispatch]
  );

  return (
    <PageWrapper getData={getData}>
      <ProjectOkk />
    </PageWrapper>
  );
};
export default ProjectOkkPage;
