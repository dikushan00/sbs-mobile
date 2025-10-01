import { BOTTOM_DRAWER_KEYS } from "@/components/BottomDrawer/services";
import { CustomLoader } from "@/components/common/CustomLoader";
import { NotFound } from "@/components/common/NotFound";
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { COLORS, STORAGE_KEYS } from "@/constants";
import { AppDispatch } from "@/services/redux";
import {
  closeBottomDrawer,
  setPageSettings,
  showBottomDrawer,
} from "@/services/redux/reducers/app";
import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { storageService } from "@/services/storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import uuid from "react-native-uuid";
import { useDispatch } from "react-redux";
import { CheckList } from "./CheckList";
import { Schema, schemaHeight } from "./Schema";
import { CheckListSubmitBtns } from "./checkListSubmitBtns";
import { PointType, OkkTaskType } from "./services";
import { FileType } from "@/services/types";

type PropsType = {
  data: OkkTaskType | null;
  isFetching?: boolean;
  isEditable?: boolean;
  onBack: (n?: boolean) => void;
};

const { width, height: windowHeight } = Dimensions.get("window");

export const OkkDetail = ({
  data: dataProps,
  isFetching,
  isEditable,
  onBack,
}: PropsType) => {
  const { showErrorSnackbar } = useSnackbar();
  const [activeCheckListId, setActiveCheckListId] = useState<number | null>(
    null
  );
  const [data, setData] = useState<OkkTaskType | null>(null);
  const [activePoint, setActivePoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllPointsMode, setShowAllPointsMode] = useState(false);
  const [activePointId, setActivePointId] = useState<number | string | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (dataProps) {
      (async () => {
        let checkList =
          (await storageService.getData(STORAGE_KEYS.checkListPoints)) || [];
        const localChecklists = checkList?.filter(
          (item) => item.help_call_id === data?.help_call_id
        );

        setData({
          ...dataProps,
          check_list: dataProps?.check_list?.map((item) => {
            const checkList = localChecklists?.find(
              (l) => l.check_list_id === item.check_list_id
            );
            let chekcListPoints = checkList?.points || [];
            const localPoints = chekcListPoints?.filter(
              (item) => !item.call_check_list_point_id
            );
            const localServerPoints = chekcListPoints?.filter(
              (item) => !!item.call_check_list_point_id
            );

            let points: PointType[] = [...localPoints];
            if (item.points) {
              const editedServerPoints = item.points.map((pt) => {
                const localPoint = localServerPoints.find(
                  (lpt) =>
                    lpt.call_check_list_point_id === pt.call_check_list_point_id
                );
                if (localPoint) {
                  return { ...pt, ...localPoint };
                }
                return pt;
              });
              points = [...points, ...editedServerPoints];
            }
            if (checkList) {
              return {
                ...item,
                check_list_is_accepted:
                  checkList?.check_list_is_accepted || null,
                points,
              };
            }
            return item;
          }),
        });
      })();
    }
  }, [dataProps, data?.help_call_id]);

  useEffect(() => {
    if (data)
      dispatch(
        setPageHeaderData({
          title: "",
          desc: `${data?.floor} этаж, ${data?.placement_type_name}, ${data?.work_set_check_group_short_name}`,
        })
      );
    return () => {
      dispatch(
        setPageHeaderData({
          title: "Контроллер",
          desc: "",
        })
      );
    };
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setPageSettings({ backBtn: true, goBack: onBack }));
      return () => {
        setActivePoint(null);
        dispatch(setPageSettings({ backBtn: false, goBack: null }));
      };
    }, [])
  );

  useEffect(() => {
    setShowAllPointsMode(false);
  }, [activeCheckListId]);

  const handleFilesSubmit = async (
    files: FileType[],
    comment: string,
    _: boolean | null,
    id?: string
  ) => {
    if (!activePoint) return;
    try {
      const point: PointType = {
        ...activePoint,
        files,
        comment,
        call_check_list_point_id: null,
        id: id || uuid.v4(),
        point_is_accepted: "0",
      };

      //@ts-ignore
      setData((prev) => ({
        ...prev,
        check_list: prev?.check_list?.map((item) => {
          if (item.check_list_id === activeCheckListId) {
            let points = [point];
            if (item.points) {
              const isExist = item.points.find(
                (pointItem) => pointItem.id === point.id
              );
              if (isExist)
                points = item.points.map((pointItem) => {
                  if (pointItem.id === point.id)
                    return { ...pointItem, ...point };
                  return pointItem;
                });
              else {
                points = [...item.points, point];
              }
            }
            return { ...item, check_list_is_accepted: "0", points };
          }
          return item;
        }),
      }));

      let checkLists =
        (await storageService.getData(STORAGE_KEYS.checkListPoints)) || [];
      const isExist = !!checkLists?.find(
        (item) =>
          item.check_list_id === activeCheckListId &&
          item.help_call_id === data?.help_call_id
      );
      if (isExist) {
        checkLists = checkLists?.map((item) => {
          if (
            item.check_list_id === activeCheckListId &&
            item.help_call_id === data?.help_call_id
          ) {
            const points = item.points ? [...item.points, point] : [point];
            return { ...item, check_list_is_accepted: "0", points };
          }
          return item;
        });
      } else {
        if (data?.help_call_id && activeCheckListId) {
          const newItem = {
            help_call_id: data.help_call_id,
            check_list_id: activeCheckListId,
            points: [point],
            check_list_is_accepted: "0" as "0",
          };
          checkLists = [...checkLists, { ...newItem }];
        }
      }
      await storageService.setData(STORAGE_KEYS.checkListPoints, checkLists);
    } catch (e) {}
    setActivePoint(null);
  };

  const handlePress = (newPoint: any) => {
    if (!activeCheckListId) return showErrorSnackbar("Выберите чеклист");
    if (!newPoint) return;
    setActivePoint({ ...newPoint });
  };

  const uploadFilesToCheckList = () => {
    if (!activePoint) return;
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.uploadMedia,
        data: {
          showTextarea: true,
          onSubmit: handleFilesSubmit,
        },
      })
    );
  };

  const showPointData = (point: PointType) => {
    setActivePointId(point.call_check_list_point_id || point.id);
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.uploadMedia,
        data: {
          showTextarea: true,
          files: point?.files,
          pointData: point,
          isEditable: isEditable && point.is_accepted !== true,
          onClose: () => {
            setActivePointId(null);
            dispatch(closeBottomDrawer());
          },
          onDelete: () => deletePoint(point),
          accepted: point.point_is_accepted,
          comment: point.comment,
          onSubmit: (
            files: FileType[],
            comment: string,
            accepted: boolean | null
          ) => onEditPointSubmit(point, files, comment, accepted),
        },
      })
    );
  };

  const onEditPointSubmit = async (
    point: PointType,
    files: FileType[],
    comment: string,
    accepted: boolean | null
  ) => {
    const editedPoint = { ...point, files, comment };
    if (accepted !== null)
      editedPoint.point_is_accepted = accepted ? ("1" as "1") : ("0" as "0");
    //@ts-ignore
    setData((prev) => ({
      ...prev,
      check_list: prev?.check_list?.map((item) => {
        if (item.check_list_id === activeCheckListId) {
          const points = item.points.map((item) => {
            if (
              (item.call_check_list_point_id &&
                item.call_check_list_point_id ===
                  point.call_check_list_point_id) ||
              (item.id && item.id === point.id)
            ) {
              return editedPoint;
            }
            return item;
          });
          return {
            ...item,
            points,
            check_list_is_accepted:
              accepted === true ? item.check_list_is_accepted : "0",
          };
        }
        return item;
      }),
    }));

    if (!activeCheckListId) return;

    const activeCheckList = data?.check_list?.find(
      (item) => item.check_list_id === activeCheckListId
    );

    try {
      let checkLists = await storageService.getData(
        STORAGE_KEYS.checkListPoints
      );
      if (checkLists?.length) {
        const isExist = checkLists?.find(
          (item) =>
            item.check_list_id === activeCheckListId &&
            item.help_call_id === data?.help_call_id
        );
        if (isExist) {
          checkLists = checkLists?.map((item) => {
            if (
              item.check_list_id === activeCheckListId &&
              item.help_call_id === data?.help_call_id
            ) {
              const points = item.points.map((item) => {
                if (
                  (item.call_check_list_point_id &&
                    item.call_check_list_point_id ===
                      point.call_check_list_point_id) ||
                  (item.id && item.id === point.id)
                ) {
                  return editedPoint;
                }
                return item;
              });
              return {
                ...item,
                points,
                check_list_is_accepted:
                  accepted === true
                    ? (item.check_list_is_accepted as "0")
                    : ("0" as "0"),
              };
            }
            return item;
          });
        } else {
          checkLists = [
            ...checkLists,
            {
              check_list_id: activeCheckListId,
              help_call_id: data?.help_call_id || 0,
              points: [editedPoint],
              check_list_is_accepted:
                accepted === true
                  ? activeCheckList?.check_list_is_accepted
                  : ("0" as "0"),
            },
          ];
        }
      } else {
        checkLists = [
          {
            check_list_id: activeCheckListId,
            help_call_id: data?.help_call_id || 0,
            points: [editedPoint],
            check_list_is_accepted:
              accepted === true
                ? activeCheckList?.check_list_is_accepted
                : ("0" as "0"),
          },
        ];
      }
      await storageService.setData(STORAGE_KEYS.checkListPoints, checkLists);
    } catch (e) {}

    try {
      let checkLists =
        (await storageService.getData(STORAGE_KEYS.checkListPoints)) || [];
      checkLists = checkLists?.map((item) => {
        if (
          item.check_list_id === activeCheckListId &&
          item.help_call_id === data?.help_call_id
        ) {
          const points = item.points.map((item) => {
            if (
              (item.call_check_list_point_id &&
                item.call_check_list_point_id ===
                  point.call_check_list_point_id) ||
              (item.id && item.id === point.id)
            ) {
              const editedPoint = { ...item, files, comment };
              if (accepted !== null)
                editedPoint.point_is_accepted = accepted ? "1" : "0";
              return editedPoint;
            }
            return item;
          });
          return {
            ...item,
            points,
            check_list_is_accepted:
              accepted === true ? item.check_list_is_accepted : "0",
          };
        }
        return item;
      });
      await storageService.setData(STORAGE_KEYS.checkListPoints, checkLists);
    } catch (e) {}
    setActivePointId(null);
  };

  const onCheckStatusChange = async (
    check_list_id: number,
    accepted: "1" | "0"
  ) => {
    try {
      let checkLists = await storageService.getData(
        STORAGE_KEYS.checkListPoints
      );
      if (checkLists?.length) {
        const isExist = checkLists?.find(
          (item) =>
            item.check_list_id === check_list_id &&
            item.help_call_id === data?.help_call_id
        );
        if (isExist) {
          checkLists = checkLists?.map((item) => {
            if (
              item.check_list_id === check_list_id &&
              item.help_call_id === data?.help_call_id
            ) {
              return { ...item, check_list_is_accepted: accepted };
            }
            return item;
          });
        } else {
          checkLists = [
            ...checkLists,
            {
              check_list_id,
              help_call_id: data?.help_call_id || 0,
              points: [],
              check_list_is_accepted: accepted,
            },
          ];
        }
      } else {
        checkLists = [
          {
            check_list_id,
            help_call_id: data?.help_call_id || 0,
            points: [],
            check_list_is_accepted: accepted,
          },
        ];
      }
      await storageService.setData(STORAGE_KEYS.checkListPoints, checkLists);
    } catch (e) {}
    //@ts-ignore
    setData((prev) => ({
      ...prev,
      check_list: prev?.check_list?.map((item) => {
        if (item.check_list_id === check_list_id)
          return { ...item, check_list_is_accepted: accepted };
        return item;
      }),
    }));
  };

  const handleActiveCheckListChange = (check_list_id: number) => {
    setActivePoint(null);
    if (check_list_id === activeCheckListId) return setActiveCheckListId(null);
    setActiveCheckListId(check_list_id);
  };

  const activeCheckList = useMemo(() => {
    const checkList = data?.check_list?.find(
      (item) => item.check_list_id === activeCheckListId
    );
    return checkList;
  }, [activeCheckListId, data]);

  const deletePoint = async (point: PointType) => {
    if (!activeCheckListId || point.call_check_list_point_id) return;

    try {
      let checkLists =
        (await storageService.getData(STORAGE_KEYS.checkListPoints)) || [];
      checkLists = checkLists
        ?.map((item) => {
          if (
            item.check_list_id === activeCheckListId &&
            item.help_call_id === data?.help_call_id
          ) {
            const points = item.points.filter((item) => item.id !== point.id);
            return { ...item, points };
          }
          return item;
        })
        .filter(
          (item) =>
            !(!item.points?.length && item.check_list_is_accepted === "0")
        );
      await storageService.setData(STORAGE_KEYS.checkListPoints, checkLists);
    } catch (e) {}
    //@ts-ignore
    setData((prev) => ({
      ...prev,
      check_list: prev?.check_list?.map((item) => {
        if (item.check_list_id === activeCheckListId) {
          const points = item.points.filter((item) => item.id !== point.id);
          return {
            ...item,
            points,
            check_list_is_accepted: points?.length
              ? item.check_list_is_accepted
              : null,
          };
        }
        return item;
      }),
    }));
    dispatch(closeBottomDrawer());
  };

  const getPointsData = (points: PointType[]) => {
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
  const isSubmitDisabled = useMemo(() => {
    return false;
  }, [data]);

  if (!data) {
    if (isFetching) return <CustomLoader />;
    else return <NotFound />;
  }
  return (
    <View style={{ flex: 1 }}>
      {(isFetching || loading) && <CustomLoader />}
      {isEditable && (
        <View style={{ padding: 10 }}>
          <CheckListSubmitBtns
            disabled={isSubmitDisabled}
            help_call_id={data.help_call_id}
            onSuccess={() => {
              onBack(true);
            }}
            loading={loading}
            setLoading={setLoading}
            params={{ resident_id: data.resident_id, entrance: data.entrance }}
            data={data?.check_list || []}
          />
        </View>
      )}
      <Schema
        isEditable={isEditable}
        showAllPoints={showAllPointsMode}
        handlePress={handlePress}
        data={data}
        points={activeCheckList?.points || []}
        activePoint={activePoint}
        activePointId={activePointId}
        showPointData={showPointData}
      />

      <ScrollView
        style={[
          styles.container,
          { height: windowHeight - schemaHeight - 115 },
        ]}
        contentContainerStyle={{ paddingBottom: 15, gap: 10 }}
      >
        <View
          style={{
            backgroundColor: COLORS.white,
            padding: 15,
            flex: 1,
            minHeight: windowHeight - schemaHeight - 115,
          }}
        >
          {!!data?.check_list?.length ? (
            <View style={styles.works}>
              {data?.check_list?.map((item) => {
                const pointsData = getPointsData(item.points);
                return (
                  <CheckList
                    key={item.check_list_id.toString()}
                    onClick={handleActiveCheckListChange}
                    activeCheckListId={activeCheckListId}
                    activePoint={activePoint}
                    data={item}
                    showAllPointsMode={showAllPointsMode}
                    setShowAllPointsMode={setShowAllPointsMode}
                    isEditable={isEditable}
                    pointsData={pointsData}
                    uploadFilesToCheckList={uploadFilesToCheckList}
                    onCheckStatusChange={onCheckStatusChange}
                  />
                );
              })}
            </View>
          ) : (
            <NotFound />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 10,
    gap: 10,
    // height: "100%",
  },
  works: {
    gap: 10,
  },
  image: {
    width: width,
    height: schemaHeight,
    objectFit: "contain",
    opacity: 0.7,
  },
});
