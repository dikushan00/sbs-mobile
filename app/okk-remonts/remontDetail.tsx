import { OkkRemontDetail } from "@/components/pages/okk/OkkRemontDetail";
import { getOkkRemont } from "@/components/pages/okk/services";
import { getRemontDetail } from "@/components/pages/remonts/services";
import { PageWrapper } from "@/components/PageWrapper";
import { AppDispatch } from "@/services/redux";
import {
  setPageHeaderData,
  setRemontInfo,
} from "@/services/redux/reducers/userApp";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

type PropsType = {
  route: { params: { remont_id: number } };
};
const OkkRemontsDetailPage = ({ route }: PropsType) => {
  const { remont_id } = route.params;
  const dispatch: AppDispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);

  const getData = async (controller?: AbortController) => {
    setIsFetching(true);
    const res = await getOkkRemont(remont_id, controller?.signal);
    setIsFetching(false);
    if (!res) {
      dispatch(setRemontInfo(null));
      return;
    }
    dispatch(
      setPageHeaderData({
        title: res?.address || "",
      })
    );
    dispatch(setRemontInfo(res));
  };

  const getDataCallback = useCallback(getData, [remont_id]);
  return (
    <PageWrapper getData={getDataCallback}>
      <OkkRemontDetail
        remontId={Number(remont_id)}
        isFetching={isFetching}
        getData={getData}
      />
    </PageWrapper>
  );
};
export default OkkRemontsDetailPage;
