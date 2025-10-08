import CloseCircle from "@/assets/icons/close_circle.svg";
import CloseCircleRed from "@/assets/icons/close-circle-red.svg";
import ArrowRight from "@/assets/icons/arrow-right.svg";
import Download from "./iconComponents/download";
import Cloud from "./iconComponents/cloud";
import Close from "@/assets/icons/close.svg";
import FullScreen from "@/assets/icons/full-screen.svg";
import AddCircle from "@/assets/icons/add-cirlce.svg";
import Back from "@/assets/icons/back.svg";
import CheckCircle from "@/assets/icons/check-circle.svg";
import Info from "@/assets/icons/info.svg";
import Folder from "@/assets/icons/folder.svg";
import Map from "@/assets/icons/map.svg";
import Materials from "@/assets/icons/materials.svg";
import Payment from "@/assets/icons/payment.svg";
import Document from "@/assets/icons/document.svg";
import Flag from "@/assets/icons/flag.svg";
import { ViewStyle } from "react-native";

const icons = {
  download: Download,
  closeCircle: CloseCircle,
  closeCircleRed: CloseCircleRed,
  arrowRight: ArrowRight,
  close: Close,
  addCircle: AddCircle,
  checkCircle: CheckCircle,
  fullScreen: FullScreen,
  back: Back,
  cloud: Cloud,
  info: Info,
  folder: Folder,
  map: Map,
  materials: Materials,
  payment: Payment,
  document: Document,
  flag: Flag,
};

type IconKeysType = keyof typeof icons;
type PropsType = {
  name: IconKeysType;
  style?: ViewStyle;
  height?: number;
  width?: number;
  fill?: string;
  stroke?: string;
  disabled?: boolean;
};

export const Icon = ({ name, ...props }: PropsType) => {
  const Component = icons[name];
  if (!Component) return null;

  return <Component {...props} />;
};
