import { CustomButton } from "@/components/common/CustomButton";
import { COLORS, FONT } from "@/constants";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ConfirmDrawerType } from "../types";

type PropsType = { data: ConfirmDrawerType; handleClose: () => void };
export const ConfirmBlock = ({ data, handleClose }: PropsType) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    data.onSubmit && (await data.onSubmit());
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data?.title || ""}</Text>

      <CustomButton
        type="contained"
        color={data?.cancelMode ? COLORS.error : COLORS.primary}
        onClick={handlePress}
        disabled={loading}
        title={data?.submitBtnText || "Отправить"}
      />
      <CustomButton
        type="outlined"
        onClick={data.onClose ? data.onClose : handleClose}
        disabled={loading}
        color={COLORS.error}
        title="Отмена"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 15, width: "100%", padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONT.regular,
    marginBottom: 20,
  },
});
