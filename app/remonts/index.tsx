import { Remonts } from "@/components/pages/remonts/Remonts";
import { PageWrapper } from "@/components/PageWrapper";
import { getRemontsData } from "@/services/redux/reducers/userApp";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";

const RemontsPage = () => {
  const dispatch = useDispatch();

  const getData = useCallback(
    async (controller?: AbortController) => {
      dispatch(
        getRemontsData(() => {}, { signal: controller?.signal }) as never
      );
    },
    [dispatch]
  );

  return (
    <PageWrapper getData={getData}>
      <Remonts />
    </PageWrapper>
  );
};
export default RemontsPage;
