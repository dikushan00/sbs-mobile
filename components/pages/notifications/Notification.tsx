import { CustomButton } from "@/components/common/CustomButton";
import { COLORS, FONT, PAGE_NAMES, SHADOWS } from "@/constants";
import { NotificationType } from "@/services/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

export const Notification = ({ data }: { data: NotificationType }) => {
  const navigation = useNavigation();

  const goToRemont = (code: string) => {
    if(code === 'OKK_CHECK_CALL') {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.okk as never,
        { help_call_id: data.help_call_id } as never
      );
    }
    if(code === 'OKK_CHECK_ACCEPT' || code === 'OKK_CHECK_REJECT') {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.main as never,
        { project_id: data.project_id, tab: 'okk' } as never
      );
    }
    if(code === 'PROJECT_AGREEMENT_SIGN') {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.main as never,
        { project_id: data.project_id, tab: 'agreement' } as never
      );
    }
    if(code === 'FLOOR_MAP_DOCUMENT_SIGN') {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.main as never,
        { project_id: data.project_id, tab: 'documents' } as never
      );
    }
    navigation.navigate(
      //@ts-ignore
      PAGE_NAMES.main as never,
      { remont_id: data.project_id } as never
    );
  };

  const getBtnTitle = () => {
    if(data.mobile_notify_type_code === 'OKK_CHECK_CALL') {
      return 'Перейти к вызову';
    }
    if(data.mobile_notify_type_code === 'OKK_CHECK_ACCEPT' || data.mobile_notify_type_code === 'OKK_CHECK_REJECT') {
      return 'Перейти к вызову ОКК';
    }
    if(data.mobile_notify_type_code === 'PROJECT_AGREEMENT_SIGN') {
      return 'Перейти к договору';
    }
    if(data.mobile_notify_type_code === 'FLOOR_MAP_DOCUMENT_SIGN') {
      return 'Перейти к документам';
    }
    return 'Перейти к проекту';
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{data.mobile_notify_title}</Text>
      <Text style={styles.text}>{data.mobile_notify_text}</Text>
      {(!!data.project_id || !!data.help_call_id) && (
        <CustomButton
          small
          autoHeight
          stylesProps={{ marginTop: 13, paddingVertical: 7, paddingHorizontal: 7, alignSelf: 'flex-start' }}
          allWidth={false}
          onClick={() => goToRemont(data.mobile_notify_type_code)}
          title={getBtnTitle()}
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
