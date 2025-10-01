import { CustomButton } from "@/components/common/CustomButton";
import { COLORS, FONT, PAGE_NAMES, SHADOWS } from "@/constants";
import { NotificationType } from "@/services/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

export const Notification = ({ data }: { data: NotificationType }) => {
  const navigation = useNavigation();

  const goToRemont = () => {
    navigation.navigate(
      //@ts-ignore
      PAGE_NAMES.remontDetail as never,
      { remont_id: data.remont_id } as never
    );
  };
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{data.mobile_notify_title}</Text>
      <Text style={styles.text}>{data.mobile_notify_text}</Text>
      {!!data.remont_id && (
        <CustomButton
          small
          autoHeight
          stylesProps={{ width: 170, marginTop: 10 }}
          allWidth={false}
          onClick={goToRemont}
          title="Перейти в ремонт"
          childrenRight
        >
          <FontAwesome5
            name="arrow-alt-circle-right"
            color={COLORS.primary}
            size={16}
          />
        </CustomButton>
      )}
      <View style={{ alignItems: "flex-end", width: "100%" }}>
        <Text style={styles.date}>{data.date_create}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    ...SHADOWS.small,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: "#404040",
  },
  text: {
    fontSize: 15,
    marginTop: 5,
    color: "#404040",
  },
  date: {
    marginTop: 5,
    fontSize: 12,
    color: "#797979",
  },
});
