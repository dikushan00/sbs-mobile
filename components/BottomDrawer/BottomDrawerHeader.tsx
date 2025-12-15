import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../Icon";
import { COLORS } from "@/constants";
import { useSelector } from "react-redux";
import { appState } from "@/services/redux/reducers/app";

export const BottomDrawerHeader = ({
  handleClose,
  title,
}: {
  handleClose: () => void;
  title: string;
}) => {
  const {
    bottomDrawerData: { loading },
  } = useSelector(appState);

  const onClose = () => {
    if(loading) return
    handleClose && handleClose()
  }
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title || ""}</Text>
      <Pressable onPress={onClose}>
        <View style={styles.close}>
          <Icon name="close" stroke={COLORS.darkGray} width={25} height={25} />
        </View>
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    width: "83%",
  },
  header: {
    marginTop: -10,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  close: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
});
