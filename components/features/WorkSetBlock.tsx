import { COLORS, FONT, PAGE_NAMES, SHADOWS } from "@/constants";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/services";
import { CustomButton } from "../common/CustomButton";
import { CustomChip } from "../common/CustomChip";
import { InfoItem } from "../common/InfoBlock";
import {
  getWorkBtnTitle,
  workStatusData,
  workStatuses,
} from "../pages/remonts/services";
import { WorkType } from "../pages/remonts/types";
import { userAppState } from "@/services/redux/reducers/userApp";
import { okkWorkStatuses, okkWorkStatusesData } from "../pages/okk/services";

type PropsType = {
  data: WorkType;
  showRemontInfo?: boolean;
  darkMode?: boolean;
  remontId?: number | null;
  onWorkSubmit?: (res: WorkType[]) => void;
};
export const WorkSetBlock = ({
  data,
  remontId,
  showRemontInfo = false,
  darkMode = false,
  onWorkSubmit,
}: PropsType) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isOkk } = useSelector(userAppState);

  const handleWork = async (data: WorkType) => {
    if (isOkk) {
      return dispatch(
        showBottomDrawer({
          type: BOTTOM_DRAWER_KEYS.workReport,
          data: {
            ...data,
            workSet: data,
            remontId: remontId || data?.remont_id || null,
          },
        })
      );
    }
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.uploadMediaCheck,
        data: {
          remontId: remontId || data?.remont_id || null,
          work_set_id: data.work_set_id,
          workSet: data,
          status: data.work_status,
          rooms: data.rooms || [],
          tasksMode: !!showRemontInfo,
          onSubmit: onWorkSubmit,
        },
      })
    );
  };

  const showHistory = () => {
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.workSetHistory,
        data: {
          workSet: data,
          tasksMode: !!showRemontInfo,
          remontId: remontId || data?.remont_id || null,
          onSubmit: onWorkSubmit,
        },
      })
    );
  };

  const showHistoryBtn = useMemo(() => {
    if (data.isOfflineData || isOkk) return true;
    return !!data.work_status && data.work_status !== workStatuses.NOT_STARTED;
  }, [data, isOkk]);

  const goToRemont = () => {
    navigation.navigate(
      //@ts-ignore
      PAGE_NAMES.remontDetail as never,
      { remont_id: data.remont_id } as never
    );
  };

  const blockStyles = useMemo(() => {
    let style = {
      ...styles.workItem,
    };
    if (darkMode) {
      style = {
        ...style,
        backgroundColor: darkMode ? "#e5edf7" : "#f4f9ff",
        ...SHADOWS.small,
      };
    }
    return style;
  }, [darkMode]);

  const showFooter = useMemo(() => {
    if (isOkk) return data.check_status_code !== okkWorkStatuses.CHECKED;

    return (
      data.work_status !== workStatuses.DONE &&
      data.work_status !== workStatuses.SENT_VERIFICATION
    );
  }, [data, isOkk]);

  return (
    <View style={blockStyles}>
      <View>
        <View style={styles.workItemTitle}>
          {data.isOfflineData && (
            <FontAwesome5 name="sync-alt" size={12} color={COLORS.warning} />
          )}
          <Text style={styles.workName}>{data.work_set_name}</Text>
        </View>
        <View style={styles.statusWrapper}>
          {isOkk ? (
            <CustomChip
              title={
                data.check_status_code
                  ? okkWorkStatusesData[data.check_status_code]?.name
                  : "Не начат"
              }
              backgroundColor={
                okkWorkStatusesData[data.check_status_code]?.backgroundColor
              }
              textColor={okkWorkStatusesData[data.check_status_code]?.textColor}
              icon={okkWorkStatusesData[data.check_status_code]?.icon}
            />
          ) : (
            <CustomChip
              title={
                data.work_status
                  ? workStatusData[data.work_status]?.name
                  : "Не начат"
              }
              backgroundColor={
                workStatusData[data.work_status]?.backgroundColor
              }
              textColor={workStatusData[data.work_status]?.textColor}
              icon={workStatusData[data.work_status]?.icon}
            />
          )}
          {showHistoryBtn && (
            <TouchableOpacity style={{ padding: 5 }} onPress={showHistory}>
              <FontAwesome5 name="history" size={16} color={COLORS.warning} />
            </TouchableOpacity>
          )}
        </View>
        {showRemontInfo && data?.remont_id && (
          <TouchableOpacity
            onPress={goToRemont}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Text>Ремонт ID: {data.remont_id}</Text>
            <FontAwesome5
              name="external-link-alt"
              size={16}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
        {isOkk ? (
          <InfoItem icon="paint-roller">{data?.work_amount}</InfoItem>
        ) : (
          <InfoItem icon="money-bill">
            {data.work_set_price_info || ""}
          </InfoItem>
        )}
        {isOkk ? (
          <InfoItem icon="calendar-check" textChildren={false}>
            <Text style={styles.dateText}>{data.end_date || ""}</Text>
          </InfoItem>
        ) : (
          <>
            <InfoItem icon="calendar">
              <Text style={styles.dateText}>{data.date_begin_plan || ""}</Text>
            </InfoItem>
            <InfoItem icon="calendar-check" textChildren={false}>
              <Text style={styles.dateText}>{data.date_end_plan || ""}</Text>
            </InfoItem>
          </>
        )}
        {showFooter && (
          <View style={styles.workItemFooter}>
            <CustomButton
              small
              autoHeight
              stylesProps={{ width: 180 }}
              allWidth={false}
              onClick={() => handleWork(data)}
              type="contained"
              title={isOkk ? "Проверка" : getWorkBtnTitle(data.work_status)}
            />
          </View>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  statusWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
    marginVertical: 5,
    width: "100%",
  },
  workItem: {
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
    backgroundColor: "#f4f9ff",
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  workItemTitle: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  workName: {
    fontFamily: FONT.bold,
    fontSize: 16,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
  },
  workItemFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    justifyContent: "flex-start",
    flexWrap: "wrap",
    width: "100%",
  },
});
