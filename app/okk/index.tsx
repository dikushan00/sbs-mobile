import { okkStatuses } from "@/components/pages/okk/services";
import { Okk } from "@/components/pages/okk/okk";
import { PageWrapper } from "@/components/PageWrapper";
import { getOkkData } from "@/services/redux/reducers/userApp";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { NavigationLayout } from "@/components/layout/NavigationLayout";

const OkkPage = () => {
  const dispatch = useDispatch();

  const getData = useCallback(
    async (controller?: AbortController) => {
      dispatch(
        getOkkData(
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
      <NavigationLayout>
        <Okk />
      </NavigationLayout>
    </PageWrapper>
  );
};
export default OkkPage;
