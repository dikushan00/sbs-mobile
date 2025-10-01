import { BlockWrapper } from "@/components/common/BlockWrapper";
import { CustomButton } from "@/components/common/CustomButton";
import { CustomLoader } from "@/components/common/CustomLoader";
import { CustomTabs } from "@/components/common/CustomTabs";
import { NotFound } from "@/components/common/NotFound";
import { WorkSetBlock } from "@/components/features/WorkSetBlock";
import { COLORS, FONT } from "@/constants";
import { AppDispatch } from "@/services/redux";
import {
  setPageHeaderData,
  setRemontInfo,
  userAppState,
} from "@/services/redux/reducers/userApp";
import { sortByLength } from "@/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RemontInfo } from "../remonts/RemontInfo";
import { okkWorkStatuses, okkWorkStatusesData } from "./services";

type PropsType = {
  remontId: number;
  isFetching: boolean;
  getData: (controller?: AbortController) => void;
};

export const OkkRemontDetail = ({
  remontId,
  getData,
  isFetching,
}: PropsType) => {
  const dispatch: AppDispatch = useDispatch();
  const [openingUrl, setOpeningUrl] = useState(false);
  const [activeTab, setActiveTab] = useState(okkWorkStatuses.ALL);
  const { remontInfo } = useSelector(userAppState);

  useFocusEffect(
    useCallback(() => {
      dispatch(setPageHeaderData({ title: "", desc: "", descColor: "" }));
      setActiveTab(okkWorkStatuses.ALL);
      const controller = new AbortController();
      getData(controller);
      return () => controller.abort();
    }, [remontId])
  );

  useEffect(() => {
    return () => {
      dispatch(setRemontInfo(null));
      dispatch(setPageHeaderData({ title: "", desc: "", descColor: "" }));
    };
  }, [remontId]);

  const handleRoad = async () => {
    if (remontInfo?.dgis_url) {
      setOpeningUrl(true);
      await Linking.openURL(remontInfo?.dgis_url).catch((err) =>
        console.error("Failed to open store:", err)
      );
      setOpeningUrl(false);
    }
  };

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const tabsData = useMemo(() => {
    const tabs = Object.keys(okkWorkStatusesData).map((key) => {
      const length =
        remontInfo?.work_set_info?.filter(
          (item) => item.check_status_code === key
        )?.length || 0;

      return {
        value: key,
        label: `${okkWorkStatusesData[key].name} (${length || 0})`,
        length,
      };
    });
    const allTabs = [
      {
        label: `Все (${remontInfo?.work_set_info?.length || 0})`,
        value: okkWorkStatuses.ALL,
        length: remontInfo?.work_set_info?.length || 0,
      },
      ...tabs,
    ];
    return sortByLength(allTabs);
  }, [remontInfo?.work_set_info]);

  const workSetsFiltered = useMemo(() => {
    if (activeTab === okkWorkStatuses.ALL) return remontInfo?.work_set_info;
    return remontInfo?.work_set_info?.filter(
      (item) => item.check_status_code === activeTab
    );
  }, [remontInfo?.work_set_info, activeTab]);

  if (!remontInfo) {
    if (isFetching) return <CustomLoader />;
    else return <NotFound />;
  }
  return (
    <View style={{ flex: 1 }}>
      {isFetching && <CustomLoader />}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={getData} />
        }
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 15, gap: 10 }}
      >
        <BlockWrapper
          title={`${remontInfo?.address}${
            remontInfo?.intercom !== null
              ? `, код домофона: ${remontInfo?.intercom || ""}`
              : ""
          }`}
        >
          <Text style={styles.address}>{remontInfo?.resident_address}</Text>
          <View style={styles.btns}>
            <CustomButton
              small
              autoHeight
              stylesProps={{ width: 120, height: 42 }}
              allWidth={false}
              onClick={handleRoad}
              title="Маршрут"
              disabled={!remontInfo?.dgis_url || openingUrl}
            >
              <FontAwesome5
                name="map-marked-alt"
                color={COLORS.primary}
                size={16}
              />
            </CustomButton>
          </View>
        </BlockWrapper>
        <RemontInfo data={remontInfo} title={"О ремонте"} detail />
        <BlockWrapper
          title="Задачи"
          style={{
            paddingBottom:
              Number(remontInfo?.work_set_info?.length) > 1 ? 55 : 15,
          }}
        >
          <View style={styles.tabsWrapper}>
            <CustomTabs
              data={tabsData}
              defaultActive={activeTab}
              onChange={onTabChange}
            />
          </View>
          {!!workSetsFiltered?.length ? (
            <View style={styles.works}>
              {workSetsFiltered?.map((item) => {
                return (
                  <WorkSetBlock
                    key={item.work_set_id.toString()}
                    remontId={remontId}
                    data={item}
                  />
                );
              })}
            </View>
          ) : (
            <NotFound />
          )}
        </BlockWrapper>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
    paddingTop: 10,
    gap: 10,
    height: "100%",
  },
  btns: {
    marginTop: 15,
    gap: 10,
    flexDirection: "row",
  },
  tabsWrapper: {
    marginTop: 15,
  },
  works: {
    marginTop: 15,
    gap: 10,
  },
  codeInfo: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 180,
    marginTop: 10,
    height: 38,
    backgroundColor: COLORS.primary,
  },
  codeInfoText: { color: "#fff", fontFamily: FONT.bold },
  address: { fontSize: 15 },
});
