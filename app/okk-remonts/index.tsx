import { OkkRemonts } from "@/components/pages/okk/OkkRemonts";
import { PageWrapper } from "@/components/PageWrapper";
import { getRemontsData } from "@/services/redux/reducers/userApp";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";

const OkkRemontsPage = () => {
  const dispatch = useDispatch();

  const getData = useCallback(
    async (controller?: AbortController) => {
      dispatch(
        getRemontsData(
          () => {},
          { signal: controller?.signal },
          false,
          true
        ) as never
      );
    },
    [dispatch]
  );

  return (
    <PageWrapper getData={getData}>
      <OkkRemonts />
    </PageWrapper>
  );
};
export default OkkRemontsPage;
