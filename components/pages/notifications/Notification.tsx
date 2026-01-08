import { CustomButton } from "@/components/common/CustomButton";
import { Icon, IconKeysType } from "@/components/Icon";
import { COLORS, FONT, PAGE_NAMES } from "@/constants";
import { MobileNotifyGroupCodeType, NotificationType } from "@/services/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NOTIFICATION_GROUPS } from "./services";

export const Notification = ({ data, groupCode }: { data: NotificationType, groupCode: MobileNotifyGroupCodeType }) => {
  const navigation = useNavigation();

  const goToRemont = (code: string) => {
    if (code === "OKK_CHECK_CALL") {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.okk as never,
        { help_call_id: data.help_call_id } as never
      );
    }
    if (code === "OKK_CHECK_ACCEPT" || code === "OKK_CHECK_REJECT") {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.main as never,
        { project_id: data.project_id, tab: "okk" } as never
      );
    }
    if (code === "PROJECT_AGREEMENT_SIGN") {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.main as never,
        { project_id: data.project_id, tab: "agreement" } as never
      );
    }
    if (code === "FLOOR_MAP_DOCUMENT_SIGN") {
      return navigation.navigate(
        //@ts-ignore
        PAGE_NAMES.main as never,
        { project_id: data.project_id, tab: "documents" } as never
      );
    }
    navigation.navigate(
      //@ts-ignore
      PAGE_NAMES.main as never,
      { remont_id: data.project_id } as never
    );
  };

  const hasAction = !!data.project_id || !!data.help_call_id;

  const groupInfo = NOTIFICATION_GROUPS[groupCode];
  const iconName = groupInfo?.icon as IconKeysType || "documentOutline" as IconKeysType;

  const getBtnTitle = () => {
    if (data.mobile_notify_type_code === "OKK_CHECK_CALL") {
      return "Перейти к вызову";
    }
    if (
      data.mobile_notify_type_code === "OKK_CHECK_ACCEPT" ||
      data.mobile_notify_type_code === "OKK_CHECK_REJECT"
    ) {
      return "Перейти к вызову ОКК";
    }
    if (data.mobile_notify_type_code === "PROJECT_AGREEMENT_SIGN") {
      return "Перейти к договору";
    }
    if (data.mobile_notify_type_code === "FLOOR_MAP_DOCUMENT_SIGN") {
      return "Перейти к документам";
    }
    return "Перейти к проекту";
  };

  return (
    <View style={styles.container}>
      {/* Иконка слева */}
      <View style={styles.iconWrapper}>
        <Icon name={iconName} width={18} height={18} fill={COLORS.primarySecondary} />
      </View>

      {/* Бабл с сообщением */}
      <View style={styles.bubble}>
        <View style={styles.bubbleContent}>
          <Text style={styles.title}>{data.mobile_notify_title}</Text>
          {!!data.mobile_notify_text && (
            <Text style={styles.text}>{data.mobile_notify_text}</Text>
          )}
          {hasAction && (
            <Pressable
              onPress={() => goToRemont(data.mobile_notify_type_code)}
            >
              <Text style={styles.buttonText}>{getBtnTitle()}</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.time}>{data.date_create || ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    maxWidth: 280,
  },
  bubbleContent: {
    gap: 8,
  },
  title: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    lineHeight: 18,
    color: COLORS.primarySecondary,
  },
  text: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 18,
    color: COLORS.dark,
  },
  button: {
    marginTop: 8,
    paddingVertical: 7,
    paddingHorizontal: 7,
    alignSelf: "flex-start",
  },
  time: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.gray,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  buttonText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.primarySecondary,
    textDecorationLine: "underline",
  },
});
