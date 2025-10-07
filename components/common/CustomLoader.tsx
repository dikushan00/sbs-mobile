import { COLORS } from "@/constants";
import { ViewStyle } from "react-native";
import { ProgressBar } from "react-native-paper";

export const CustomLoader = ({ style }: { style?: ViewStyle }) => {
  return (
    <ProgressBar
      progress={1}
      style={style ? { ...style } : { backgroundColor: COLORS.background }}
      indeterminate
      color={COLORS.primary}
    />
  );
};
