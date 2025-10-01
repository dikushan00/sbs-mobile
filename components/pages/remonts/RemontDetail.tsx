import { BOTTOM_DRAWER_KEYS } from "@/components/BottomDrawer/services";
import { BlockWrapper } from "@/components/common/BlockWrapper";
import { CustomButton } from "@/components/common/CustomButton";
import { CustomLoader } from "@/components/common/CustomLoader";
import { CustomTabs } from "@/components/common/CustomTabs";
import { NotFound } from "@/components/common/NotFound";
import { WorkSetBlock } from "@/components/features/WorkSetBlock";
import { Icon } from "@/components/Icon";
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { COLORS, FILE_URL, FONT } from "@/constants";
import { AppDispatch } from "@/services/redux";
import {
  closeBottomDrawer,
  showBottomDrawer,
} from "@/services/redux/reducers/app";
import {
  changeRemontsData,
  setPageHeaderData,
  setRemontInfo,
  userAppState,
} from "@/services/redux/reducers/userApp";
import { getFileInfo, openFile } from "@/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
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
import { RemontInfo } from "./RemontInfo";
import {
  acceptOrRefuseRemont,
  passKeys,
  receiveKeys,
  workStatusData,
  workStatuses,
} from "./services";

type PropsType = {
  remontId: number;
  isFetching: boolean;
  getData: (controller?: AbortController) => void;
};

export const RemontDetail = ({ remontId, getData, isFetching }: PropsType) => {
  const dispatch: AppDispatch = useDispatch();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [openingUrl, setOpeningUrl] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(workStatuses.ALL);
  const { remontInfo } = useSelector(userAppState);

  const checkIfFileExist = async () => {
    const fileInfo = await getFileInfo(`remont_project_${remontId}.pdf`);
    setDownloaded(!!fileInfo?.exists);
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(setPageHeaderData({ title: "", desc: "", descColor: "" }));
      setActiveTab(workStatuses.ALL);
      const controller = new AbortController();
      getData(controller);
      return () => controller.abort();
    }, [remontId])
  );

  useEffect(() => {
    checkIfFileExist();
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

  const onChangeRemontAccept = async (isAccepted: boolean) => {
    const res = await acceptOrRefuseRemont(remontId, isAccepted);
    if (!res) return;
    dispatch(setRemontInfo(res));
    showSuccessSnackbar(
      isAccepted ? "Вы взяли в работу" : "Вы отказались от ремонта"
    );
    dispatch(closeBottomDrawer());
  };

  const handleTakeWork = () => {
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.confirm,
        data: {
          title: "Вы действительно хотите взять проект в работу?",
          submitBtnText: "Да, взять работу",
          onSubmit: () => onChangeRemontAccept(true),
        },
      })
    );
  };

  const downloadProject = async () => {
    if (downloading) return;
    try {
      const fileName = `remont_project_${remontId}.pdf`;
      if (downloaded) return await openFile(fileName);

      const uri: string = `${FILE_URL}${remontInfo?.project_remont_url}`;
      const fileUri = FileSystem.documentDirectory + fileName;
      setDownloading(true);
      const response = uri && (await FileSystem.downloadAsync(uri, fileUri));
      setDownloading(false);
      if (!response) return checkIfFileExist();
      if (typeof response !== "string" && response?.status !== 200)
        return showErrorSnackbar(
          `${response?.status ? `${response?.status}. ` : ""}Не найдено`
        );
      setDownloaded(true);
    } catch (error: any) {
      error?.message && showErrorSnackbar(error?.message);
    }
  };

  const handleReceiveKeys = async () => {
    if (!remontInfo?.remont_key_request?.remont_key_id) return;
    setReceiveLoading(true);
    const res = await receiveKeys(remontId, {
      remont_key_id: remontInfo?.remont_key_request?.remont_key_id,
    });
    setReceiveLoading(false);
    if (!res) return;
    showSuccessSnackbar("Успешно");
    if (res === true) {
      if (!remontInfo) return;
      const updatedRemontData = {
        ...remontInfo,
        remont_key_request: null,
        is_active: true,
      };
      dispatch(changeRemontsData(updatedRemontData));
      return;
    }
    dispatch(setRemontInfo(res));
  };

  const onPassKey = async (team_master_id: number) => {
    if (!team_master_id) return showErrorSnackbar("Выберите мастера");
    const res = await passKeys(remontId, { team_master_id });
    if (!res) return;
    showSuccessSnackbar("Успешно");
    dispatch(closeBottomDrawer());
    if (res === true) {
      if (!remontInfo) return;
      const updatedRemontData = {
        ...remontInfo,
        remont_key_request: {
          is_accept: false,
          remont_key_id: null,
        },
        is_active: false,
      };
      updatedRemontData && dispatch(changeRemontsData(updatedRemontData));
      return;
    }
    dispatch(setRemontInfo(res));
  };

  const handlePassKey = async () => {
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.selectMaster,
        data: {
          masters: remontInfo?.team_masters || [],
          onSubmit: onPassKey,
        },
      })
    );
  };

  const tabsData = useMemo(() => {
    const tabs = Object.keys(workStatusData).map((key) => {
      const length =
        remontInfo?.work_set_info?.filter((item) => item.work_status === key)
          ?.length || 0;

      return {
        value: key,
        label: `${workStatusData[key].name} (${length || 0})`,
        length,
      };
    });
    return [
      {
        label: `Все (${remontInfo?.work_set_info?.length || 0})`,
        value: workStatuses.ALL,
        length: remontInfo?.work_set_info?.length || 0,
      },
      ...tabs,
    ].sort((a, b) => {
      if (a.length === 0 && b.length !== 0) return 1;
      if (a.length !== 0 && b.length === 0) return -1;
      return 0;
    });
  }, [remontInfo?.work_set_info]);

  const workSetsFiltered = useMemo(() => {
    if (activeTab === workStatuses.ALL) return remontInfo?.work_set_info;
    return remontInfo?.work_set_info?.filter(
      (item) => item.work_status === activeTab
    );
  }, [remontInfo?.work_set_info, activeTab]);

  const proccesing = useMemo(() => !!remontInfo?.work_status, [remontInfo]);

  if (!remontInfo) {
    if (isFetching) return <CustomLoader />;
    else return <NotFound />;
  }
  return (
    <View style={{ flex: 1 }}>
      {(receiveLoading || isFetching) && <CustomLoader />}
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
            <CustomButton
              small
              autoHeight
              stylesProps={{ maxWidth: 170, height: 42 }}
              wrapperStyles={{ flex: 1 }}
              allWidth={false}
              onClick={downloadProject}
              disabled={
                downloading || (!remontInfo?.project_remont_url && !downloaded)
              }
              title={"План проекта"}
            >
              <Icon
                name={downloaded ? "cloud" : "download"}
                disabled={
                  downloading ||
                  (!remontInfo?.project_remont_url && !downloaded)
                }
              />
            </CustomButton>
          </View>
          {!!remontInfo?.key_code && (
            <View style={styles.codeInfo}>
              <Text style={styles.codeInfoText}>
                Код от двери - {remontInfo?.key_code}
              </Text>
            </View>
          )}
          {remontInfo?.key_type === 1 &&
            (remontInfo?.is_active || !!remontInfo?.remont_key_request) && (
              <CustomButton
                small
                autoHeight
                stylesProps={{ width: 170 }}
                wrapperStyles={{ marginTop: 10 }}
                allWidth={false}
                onClick={
                  remontInfo?.is_active
                    ? handlePassKey
                    : remontInfo?.remont_key_request
                    ? handleReceiveKeys
                    : () => {}
                }
                title={
                  remontInfo?.is_active ? "Передать ключи" : "Принять ключи"
                }
                disabled={receiveLoading}
              />
            )}
        </BlockWrapper>
        <RemontInfo data={remontInfo} title={"О ремонте"} detail />
        <BlockWrapper
          title="Задачи"
          style={{
            paddingBottom: proccesing
              ? 25
              : Number(remontInfo?.work_set_info?.length) > 1
              ? 55
              : 15,
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
      {!proccesing && (
        <View style={styles.fixedButton}>
          <CustomButton
            title="Взять в работу"
            type="contained"
            allWidth
            onClick={handleTakeWork}
          />
        </View>
      )}
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
  fixedButton: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    borderRadius: 10,
    display: "none",
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
