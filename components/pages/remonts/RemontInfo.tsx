import React, { useMemo } from "react";
import { BlockWrapper } from "@/components/common/BlockWrapper";
import { InfoBlock, InfoItem } from "@/components/common/InfoBlock";
import { numberWithCommas } from "@/utils";
import { StyleSheet, Text } from "react-native";
import { RemontType } from "./types";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useSelector } from "react-redux";
import { userAppState } from "@/services/redux/reducers/userApp";

export const RemontInfo = ({
  data,
  detail = false,
  title = "",
  icon = null,
}: {
  data: RemontType | null;
  detail?: boolean;
  title: string;
  icon?: string | null;
}) => {
  const { isOkk } = useSelector(userAppState);

  const workNum = useMemo(() => {
    if (isOkk) return data?.okk_num;
    return data?.work_num;
  }, [data]);

  if (!data) return null;
  return (
    <BlockWrapper title={title} icon={icon}>
      {data.resident_address && !detail && (
        <Text style={styles.address}>{data?.resident_address}</Text>
      )}
      <InfoBlock>
        <InfoItem>Ремонт ID: {data.remont_id || ""}</InfoItem>
        <InfoItem icon="list-alt">
          {isOkk ? "На проверку" : "Задач"}: {workNum ? `${workNum.all}` : ""}
          {!!workNum?.done && (
            <Text style={{ color: COLORS.success }}>
              {" "}
              ({workNum.done}{" "}
              <FontAwesome5 name="check" color={COLORS.success} size={12} />)
            </Text>
          )}
        </InfoItem>
        {!isOkk && (
          <InfoItem icon="money-bill">
            {data?.price === null ? "" : `${numberWithCommas(data?.price)} тг`}
          </InfoItem>
        )}
        {isOkk ? (
          <>
            {detail && (
              <InfoItem icon="calendar">{data?.begin_date || ""}</InfoItem>
            )}
            <InfoItem icon="calendar-check">{data?.end_date || ""}</InfoItem>
          </>
        ) : (
          <>
            <InfoItem icon="calendar">{data?.date_begin_plan || ""}</InfoItem>
            <InfoItem icon="calendar-check">
              {data?.date_end_plan || ""}
            </InfoItem>
          </>
        )}

        {!!data?.key_type && !isOkk && detail && (
          <InfoItem icon="key">
            {data?.key_type === 1 ? "По ключу" : "По коду"}
          </InfoItem>
        )}
      </InfoBlock>
    </BlockWrapper>
  );
};

const styles = StyleSheet.create({
  dateWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "nowrap",
  },
  dateText: {
    fontSize: 16,
  },
  address: {
    marginVertical: 5,
    fontSize: 15,
  },
});
