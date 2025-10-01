import { Slider } from "@/components/slider";
import { appState } from "@/services/redux/reducers/app";
import { useSelector } from "react-redux";

export const Gallery = () => {
  const { modal } = useSelector(appState);
  return <Slider files={modal?.data?.files} />;
};
