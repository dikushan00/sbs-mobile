import { CustomLoader } from "@/components/common/CustomLoader";
import { CustomSelect } from "@/components/common/CustomSelect";
import { CustomTabs } from "@/components/common/CustomTabs";
import { NotFound } from "@/components/common/NotFound";
import { COLORS, STORAGE_KEYS } from "@/constants";
import { setPageSettings } from "@/services/redux/reducers/app";
import {
  getOkkData,
  setPageHeaderData,
  userAppState,
} from "@/services/redux/reducers/userApp";
import { storageService } from "@/services/storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckListPointsType,
  Entrance,
  okkStatuses,
  okkStatusesData,
  OkkStatusKeyType,
  PointType,
  OkkTaskType,
} from "./services";
import { OkkDetail } from "./OkkDetail";

export const Okk = () => {
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCallId, setActiveCallId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<OkkStatusKeyType>(
    okkStatuses.PROCESSING as "PROCESSING"
  );
  const [selectedData, setSelectedData] = useState<OkkTaskType | null>(null);
  const [params, setParams] = useState({
    resident_id: null,
    entrance: null,
    project_id: null,
  });
  const [localPoints, setLocalPoints] = useState<CheckListPointsType[]>([]);
  const { okkData, isFetching } = useSelector(userAppState);

  const getData = async (
    isRefreshing = false,
    controller?: AbortController
  ) => {
    dispatch(
      getOkkData(
        setIsRefreshing,
        { signal: controller?.signal, params: { okk_status_code: activeTab } },
        isRefreshing
      ) as never
    );
  };

  const getLocalPoints = useCallback(async () => {
    const checkLists =
      (await storageService.getData(STORAGE_KEYS.checkListPoints)) || [];
    setLocalPoints(checkLists || []);
  }, []);

  useEffect(() => {
    dispatch(
      setPageHeaderData({
        title: "Контроллер",
        desc: "",
      })
    );
    getLocalPoints();
  }, [getLocalPoints]);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      getData(false, controller);
      return () => controller.abort();
    }, [activeTab])
  );

  const onTabChange = (tab: OkkStatusKeyType) => {
    setActiveTab(tab);
    setParams({
      resident_id: null,
      entrance: null,
      project_id: null,
    });
  };

  const onParamsChange = (key: string, value: number | null, row: any) => {
    let editedParams = { ...params };

    if (key === "resident_id") {
      editedParams.entrance = null;
      editedParams.project_id = null;
    }
    if (key === "entrance") {
      editedParams.project_id = row?.project_id;
    }
    setParams({ ...editedParams, [key]: value });
  };

  const onBack = (resetActiveCall = false) => {
    if (resetActiveCall === true) setActiveCallId(null);
    setSelectedData(null);
    dispatch(setPageSettings({ backBtn: false, goBack: null }));
    getLocalPoints();
  };

  const handleClickDetail = (help_call_id: number, item: any) => {
    if (activeTab === "PROCESSING") setActiveCallId(help_call_id);
    else setActiveCallId(null);
    setParams((prev) => ({ ...prev, help_call_id }));
    setSelectedData((prev: any) => ({ ...prev, ...item }));
    dispatch(setPageSettings({ backBtn: true, goBack: onBack }));
  };

  const tabsData = useMemo(() => {
    const tabs = Object.keys(okkStatusesData).map((key) => {
      return {
        value: key,
        label: okkStatusesData[key].name,
      };
    });
    return tabs;
  }, [okkData]);

  const entrances = useMemo(() => {
    if (!okkData?.length || !params.resident_id) return [];
    const residents = okkData?.filter(
      (item) => item.resident_id === params.resident_id
    );
    let filteredEntrances: Entrance[] = [];

    residents.forEach((resident) => {
      if (!resident?.entrances?.length) return;
      const ents =
        resident?.entrances
          ?.map((item) => ({
            ...item,
            label: `Блок ${item.block_name}`,
          }))
          ?.filter(
            (item) =>
              item.calls?.length &&
              !filteredEntrances?.find((ent) => ent.entrance === item.entrance)
          ) || [];

      filteredEntrances = [...filteredEntrances, ...ents];
    });

    return filteredEntrances;
  }, [okkData, params.resident_id]);

  const calls = useMemo(() => {
    if (!okkData?.length) return [];
    if (params.entrance) {
      const entrance = entrances?.find(
        (item) => item.entrance === params.entrance
      );
      return entrance?.calls || [];
    }
    if (!okkData?.length) return [];

    if (params.resident_id) {
      let calls: OkkTaskType[] = [];
      const residents = okkData.filter(
        (item) => item.resident_id === params.resident_id
      );
      residents.forEach((resident) => {
        resident?.entrances?.forEach((ent) => {
          if (ent.calls) calls = [...calls, ...ent.calls];
        });
      });
      return calls || [];
    }

    let calls: OkkTaskType[] = [];
    okkData.forEach((item) => {
      item.entrances?.forEach((ent) => {
        if (ent.calls) calls = [...calls, ...ent.calls];
      });
    });
    return calls || [];
  }, [okkData, params.entrance, params.resident_id, entrances]);

  useEffect(() => {
    if (calls && selectedData?.help_call_id) {
      const call = calls?.find(
        (item) => item.help_call_id === selectedData.help_call_id
      );
      call && setSelectedData(call);
    }
  }, [calls, selectedData]);

  const getPointsData = (call: OkkTaskType) => {
    const callCheckLists = localPoints?.filter(
      (item) => item.help_call_id === call.help_call_id
    );
    let callAllLocalPoints: PointType[] = [];

    callCheckLists?.forEach((item) => {
      if (item.points) {
        callAllLocalPoints = [...callAllLocalPoints, ...item.points];
      }
    });

    const callLocalPoints = callAllLocalPoints?.filter(
      (item) => !item.call_check_list_point_id
    );
    let localServerPoints = callAllLocalPoints?.filter(
      (item) => !!item.call_check_list_point_id
    );

    let points: PointType[] = [...callLocalPoints];
    call.check_list?.forEach((ch) => {
      if (ch.points?.length) {
        localServerPoints = localServerPoints.filter(
          (item) =>
            !ch.points.find(
              (pt) =>
                pt.call_check_list_point_id === item.call_check_list_point_id
            )
        );
        points = [...points, ...ch.points];
      }
    });
    points = [...points, ...localServerPoints];
    if (!points?.length)
      return { count: 0, filesCount: 0, checkedPointsCount: 0 };
    try {
      const filesCount =
        points.reduce((prev, cur) => prev + (cur.files?.length || 0), 0) || 0;
      const checkedPointsCount = points.reduce(
        (prev, cur) => prev + (cur.point_is_accepted === "1" ? 1 : 0),
        0
      );
      return { count: points.length, filesCount, checkedPointsCount };
    } catch (e) {
      return { count: 0, filesCount: 0, checkedPointsCount: 0 };
    }
  };

  const residentOptions = useMemo(() => {
    const options: { resident_id: number; resident_name: string }[] = [];
    if (okkData?.length) {
      okkData.forEach((item) => {
        const isExist = options.find(
          (opt) => opt.resident_id === item.resident_id
        );
        if (!isExist)
          options.push({
            resident_id: item.resident_id,
            resident_name: item.resident_name,
          });
      });
    }
    return options;
  }, [okkData]);

  if (selectedData?.help_call_id)
    return (
      <OkkDetail
        data={selectedData}
        onBack={onBack}
        isEditable={activeTab === "PROCESSING"}
      />
    );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => getData(true)}
        />
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      style={styles.container}
    >
      {isFetching && <CustomLoader />}
      <View style={styles.tabsWrapper}>
        <CustomTabs
          data={tabsData}
          defaultActive={activeTab}
          //@ts-ignore
          onChange={onTabChange}
        />
      </View>
      {okkData?.length ? (
        <View style={{ gap: 10, marginTop: 5 }}>
          <CustomSelect
            list={residentOptions}
            labelKey="resident_name"
            onChange={(id, item) => onParamsChange("resident_id", id, item)}
            label="ЖК"
            placeholder="Выберите ЖК"
            value={params.resident_id}
            valueKey="resident_id"
          />
          <CustomSelect
            list={entrances}
            onChange={(id, item) => onParamsChange("entrance", id, item)}
            label="Блок"
            placeholder="Выберите блок"
            valueKey="entrance"
            value={params.entrance}
          />
          <ScrollView>
            {!!calls?.length ? (
              calls.map((item) => {
                const localData = localPoints?.filter(
                  (call) => call.help_call_id === item.help_call_id
                );
                const checkListLength = item.check_list?.length || 0;

                let isEdited = false;
                if (localData?.length && checkListLength) {
                  isEdited = item.check_list?.some(
                    (cl) =>
                      !!localData?.find(
                        (item) => cl.check_list_id === item.check_list_id
                      )
                  );
                }

                const pointsData = getPointsData(item);

                return (
                  <TouchableOpacity
                    key={String(item.help_call_id)}
                    onPress={() => handleClickDetail(item.help_call_id, item)}
                    style={{ marginTop: 10 }}
                  >
                    <View
                      style={{
                        padding: 10,
                        backgroundColor:
                          activeCallId === item.help_call_id
                            ? "#FFD762"
                            : COLORS.primaryBackground,
                        borderRadius: 5,
                        gap: 5,
                        borderColor:
                          activeCallId === item.help_call_id
                            ? "#D9B753"
                            : COLORS.primaryBorder,
                        borderWidth: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ gap: 5 }}>
                        <Text style={{ fontWeight: 700, fontSize: 15 }}>
                          {item.work_set_check_group_short_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#404040" }}>
                          {item.resident_name}
                        </Text>
                        <Text style={{ fontSize: 10, color: "#404040" }}>
                          {item.placement_type_name} | {item.entrance_label} |{" "}
                          {item.floor} Этаж
                        </Text>
                      </View>
                      <View
                        style={{
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: "#404040" }}>
                            {item.call_date}
                          </Text>
                          {isEdited && (
                            <FontAwesome5
                              name="sync-alt"
                              size={14}
                              color={COLORS.warning}
                            />
                          )}
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 5,
                            gap: 15,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <FontAwesome5
                              name="exclamation-circle"
                              size={12}
                              color="#999"
                            />
                            <Text style={{ fontSize: 12, color: "#999" }}>
                              {pointsData.count}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <FontAwesome5 name="check" size={12} color="#999" />
                            <Text style={{ fontSize: 12, color: "#999" }}>
                              {pointsData.checkedPointsCount}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <FontAwesome5
                              name="paperclip"
                              size={12}
                              color="#999"
                            />
                            <Text style={{ fontSize: 12, color: "#999" }}>
                              {pointsData.filesCount}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <NotFound
                title={isFetching || isRefreshing ? "Загрузка.." : "Не найдено"}
              />
            )}
          </ScrollView>
        </View>
      ) : (
        <NotFound
          title={isFetching || isRefreshing ? "Загрузка.." : "Не найдено"}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    padding: 10,
    paddingTop: 0,
  },
  tabsWrapper: {
    marginVertical: 10,
  },
});
