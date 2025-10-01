import { BlockWrapper } from "@/components/common/BlockWrapper";
import { NotFound } from "@/components/common/NotFound";
import { FileList } from "@/components/FileList";
import {
  refactorWorkSetMedia,
  WorkHistoryStatusKeys,
  WorkStatusesKeyType,
} from "@/components/pages/remonts/services";
import {
  WorkSetFileType,
  WorkSetMediaType,
} from "@/components/pages/remonts/types";
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { COLORS, FILE_URL_MAIN } from "@/constants";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { getFileInfo, saveFile } from "@/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { BOTTOM_DRAWER_KEYS } from "../services";
import { WorkSetHistoryDrawerType } from "../types";

type PropsType = { data: WorkSetHistoryDrawerType; handleClose: () => void };

export const WorkSetHistory = ({ data }: PropsType) => {
  const dispatch = useDispatch();
  const { showSuccessSnackbar } = useSnackbar();
  const [historyData, setHistoryData] = useState<WorkSetMediaType[]>(
    refactorWorkSetMedia(data?.workSet?.media)
  );
  const [downloading, setDownloading] = useState(false);

  const handleCheck = (
    itemId: number | string | null,
    id: number,
    checked: boolean
  ) => {
    setHistoryData((prev) =>
      prev.map((item) => {
        if (item.id === itemId)
          return {
            ...item,
            files: item.files?.map((file) => {
              if (file.id === id) return { ...file, checked };
              return file;
            }),
          };
        return item;
      })
    );
  };

  const handleAddClick = async (
    code: WorkHistoryStatusKeys,
    isOfflineData: boolean | undefined,
    master_work_set_media_type_id: string | number | undefined
  ) => {
    let status: WorkStatusesKeyType | null = "STARTED";
    if (code === "BEFORE_WORK") status = "NOT_STARTED";
    if (code === "AFTER_WORK") status = "STARTED";
    if (code === "AFTER_CORRECTION") status = "ON_CORRECTION";
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.uploadMediaCheck,
        data: {
          remontId: data.remontId,
          work_set_id: data.workSet?.work_set_id,
          status,
          tasksMode: data?.tasksMode,
          rooms: data.workSet?.rooms || [],
          workSet: data.workSet,
          isOfflineData,
          master_work_set_media_type_id,
          onSubmit: data.onSubmit,
        },
      })
    );
  };

  const onSaveFile = async (
    uri: string,
    fileName: string,
    mimeType: string,
    files: { uri: string; fileName: string; mimeType: string }[]
  ) => {
    return !!(await saveFile(uri, fileName, mimeType, files));
  };

  const handleDownloadFiles = async (files: WorkSetFileType[], id: string) => {
    const checkedFiles = files?.filter((item) => item.checked);
    if (!checkedFiles?.length || downloading) return;
    const filesToDownload = await Promise.all(
      checkedFiles?.map(async (item) => {
        const fileName = item.url.split("/").pop() || "";
        const type = fileName?.split(".").pop() || "jpg";
        const mimeType = type === "png" ? "image/png" : "image/jpeg";
        if (!fileName) return;
        const fileInfo = await getFileInfo(fileName);
        if (fileInfo?.exists) return { uri: fileInfo.uri, fileName, mimeType };
        try {
          const fileUri = FileSystem.documentDirectory + fileName;
          setDownloading(true);
          const response =
            item.url && (await FileSystem.downloadAsync(item.url, fileUri));
          setDownloading(false);
          if (response && response.status === 200 && response?.uri)
            return { uri: response.uri, fileName, mimeType };
        } catch (error: any) {}
      })
    );
    const res = await onSaveFile(
      "",
      "",
      "",
      //@ts-ignore
      filesToDownload?.filter((item) => !!item) || []
    );
    if (!res) return;
    showSuccessSnackbar("Успешно");
    setHistoryData((prev) =>
      prev?.map((item) => {
        if (item.id === id)
          return {
            ...item,
            files: item.files?.map((item) => ({
              ...item,
              checked: false,
            })),
          };
        return item;
      })
    );
  };

  const renderRightContent = (data: WorkSetMediaType) => {
    const {
      id,
      master_work_set_media_type_code: code,
      files,
      is_allow: isAllowAddFiles,
      isOfflineData,
      master_work_set_media_type_id,
    } = data;
    const isCheckedExist = files?.some((item) => item.checked);
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {!isOfflineData && (
          <TouchableOpacity
            onPress={() => handleDownloadFiles(files || [], id)}
            disabled={!isCheckedExist}
            style={styles.actionItem}
          >
            <FontAwesome
              name="download"
              color={isCheckedExist ? COLORS.primary : COLORS.disabled}
              size={20}
            />
          </TouchableOpacity>
        )}
        {!!isAllowAddFiles && (
          <TouchableOpacity
            onPress={() =>
              handleAddClick(code, isOfflineData, master_work_set_media_type_id)
            }
            style={styles.actionItem}
          >
            <FontAwesome name="plus" color={COLORS.primary} size={22} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      {historyData?.length ? (
        historyData?.map((item, i) => {
          return (
            <BlockWrapper
              key={i}
              title={item.master_work_set_media_type_name}
              desc={`(${item.date || ""})`}
              renderRightContent={() => renderRightContent(item)}
              renderIcon={
                item.isOfflineData
                  ? () => (
                      <FontAwesome5
                        name="sync-alt"
                        size={14}
                        color={COLORS.warning}
                      />
                    )
                  : undefined
              }
            >
              {!!item.comment && (
                <Text style={styles.comment}>
                  Комментарий: {item.comment || ""}
                </Text>
              )}
              <FileList
                files={
                  item?.files?.map((file) => ({
                    name: "",
                    desc: file.desc || "",
                    type: "",
                    uri: file.url,
                    file: null,
                    checked: file.checked,
                  })) || []
                }
                id={item.id}
                handleCheck={handleCheck}
                checkboxMode={!item.isOfflineData}
                addBackground={false}
              />
            </BlockWrapper>
          );
        })
      ) : (
        <View style={styles.notFound}>
          <NotFound />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  comment: {
    marginTop: 5,
    color: "#404040",
    fontSize: 15,
  },
  actionItem: {
    padding: 5,
  },
  notFound: { paddingVertical: 20 },
});
