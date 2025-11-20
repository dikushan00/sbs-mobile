import CloseCircle from "@/assets/icons/close_circle.svg";
import CloseCircleRed from "@/assets/icons/close-circle-red.svg";
import ArrowRight from "@/assets/icons/arrow-right.svg";
import ArrowDown from "@/assets/icons/arrow_down.svg";
import ArrowDownColor from "@/assets/icons/arrow_down_color.svg";
import ArrowRightAlt from "@/assets/icons/arrow_right_alt.svg";
import ArrowRightBlack from "@/assets/icons/arrow_right_black.svg";
import ArrowRightAlter from "@/assets/icons/arrow-right-alt.svg";
import Download from "./iconComponents/download";
import DownloadAlt from "@/assets/icons/download_alt.svg";
import Cloud from "./iconComponents/cloud";
import Close from "@/assets/icons/close.svg";
import Clock from "@/assets/icons/clock.svg";
import ClockFilled from "@/assets/icons/clock_filled.svg";
import FullScreen from "@/assets/icons/full-screen.svg";
import AddCircle from "@/assets/icons/add-cirlce.svg";
import Back from "@/assets/icons/back.svg";
import Check from "@/assets/icons/check.svg";
import CheckCircle from "@/assets/icons/check-circle.svg";
import CheckCircleOutline from "@/assets/icons/check-circle-outline.svg";
import CheckCircleBlue from "@/assets/icons/check-circle-blue.svg";
import Success from "@/assets/icons/success.svg";
import Info from "@/assets/icons/info.svg";
import InfoOutline from "@/assets/icons/info_outline.svg";
import Folder from "@/assets/icons/folder.svg";
import Map from "@/assets/icons/map.svg";
import Materials from "@/assets/icons/materials.svg";
import Payment from "@/assets/icons/payment.svg";
import Document from "@/assets/icons/document.svg";
import DocumentAlt from "@/assets/icons/document_alt.svg";
import Flag from "@/assets/icons/flag.svg";
import FlagTime from "@/assets/icons/flat-time.svg";
import Work from "@/assets/icons/work.svg";
import People from "@/assets/icons/people.svg";
import Money from "@/assets/icons/money.svg";
import MoneyAlt from "@/assets/icons/money_alt.svg";
import MoneyDollar from "@/assets/icons/money_dollar.svg";
import Note from "@/assets/icons/note.svg";
import docCar from "@/assets/icons/doc_car.svg";
import Logout from "@/assets/icons/logout.svg";
import More from "@/assets/icons/more.svg";
import Trash from "@/assets/icons/trash.svg";
import TrashLine from "@/assets/icons/trash_line.svg";
import Search from "@/assets/icons/search.svg";
import Calendar from "@/assets/icons/calendar.svg";
import Profile from "@/assets/icons/profile.svg";
import { ViewStyle } from "react-native";

const icons = {
  download: Download,
  downloadAlt: DownloadAlt,
  closeCircle: CloseCircle,
  closeCircleRed: CloseCircleRed,
  arrowRight: ArrowRight,
  arrowDown: ArrowDown,
  arrowDownColor: ArrowDownColor,
  arrowRightBlack: ArrowRightBlack,
  arrowRightAlt: ArrowRightAlt,
  arrowRightAlter: ArrowRightAlter,
  close: Close,
  addCircle: AddCircle,
  check: Check,
  checkCircle: CheckCircle,
  checkCircleBlue: CheckCircleBlue,
  checkCircleOutline: CheckCircleOutline,
  success: Success,
  fullScreen: FullScreen,
  back: Back,
  cloud: Cloud,
  info: Info,
  infoOutline: InfoOutline,
  folder: Folder,
  map: Map,
  materials: Materials,
  payment: Payment,
  document: Document,
  documentAlt: DocumentAlt,
  flag: Flag,
  flagTime: FlagTime,
  work: Work,
  people: People,
  money: Money,
  moneyAlt: MoneyAlt,
  moneyDollar: MoneyDollar,
  note: Note,
  docCar: docCar,
  more: More,
  trash: Trash,
  trashLine: TrashLine,
  logout: Logout,
  search: Search,
  calendar: Calendar,
  profile: Profile,
  clock: Clock,
  clockFilled: ClockFilled,
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
