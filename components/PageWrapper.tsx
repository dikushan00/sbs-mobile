import {
  appState,
  setShouldPageDataReload,
} from "@/services/redux/reducers/app";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

type PropsType = {
  children: any;
  getData: (data?: any) => Promise<void>;
};
export const PageWrapper = ({ children, getData }: PropsType) => {
  const dispatch = useDispatch();
  const { shouldPageDataReload } = useSelector(appState);

  useEffect(() => {
    const updateData = async () => {
      if (getData) await getData();
      dispatch(setShouldPageDataReload(false));
    };
    if (shouldPageDataReload) updateData();
  }, [shouldPageDataReload, getData]);

  return <>{children}</>;
};
