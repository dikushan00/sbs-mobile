import { CustomButton } from "@/components/common/CustomButton";
import { FileList } from "@/components/FileList";
import { Icon } from "@/components/Icon";
import {
  addWorkSetMedia,
  beforeWorkCheck,
  changeWorkSetData,
  changeWorkSetTasksData,
  generateFilesOfflineActions,
  getRoomFiles,
  getUpdatedWorkSet,
  getWorkBtnTitle,
  submitWork,
  workStatuses,
} from "@/components/pages/remonts/services";
import {
  FileType,
  RemontType,
  RoomType,
  WorkType,
} from "@/components/pages/remonts/types";
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { FONT } from "@/constants";
import { AppDispatch } from "@/services/redux";
import {
  appState,
  closeBottomDrawer,
  setBottomDrawerLoading,
  showBottomDrawer,
} from "@/services/redux/reducers/app";
import {
  changeRemontsData,
  getMenuData,
  setRemontInfo,
  userAppState,
} from "@/services/redux/reducers/userApp";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { BOTTOM_DRAWER_KEYS } from "../services";
import { UploadMediaCheckDrawerType } from "../types";
import { okkCheck } from "@/components/pages/okk/services";

type PropsType = { data: UploadMediaCheckDrawerType; handleClose: () => void };
export interface RoomsDataType extends RoomType {
  files?: FileType[];
}
export const UploadMediaCheck = ({ data, handleClose }: PropsType) => {
  const dispatch: AppDispatch = useDispatch();
  const { showSuccessSnackbar } = useSnackbar();
  const [files, setFiles] = useState<FileType[]>([]);
  const [showRooms, setShowRooms] = useState(false);
  const [comment, setComment] = useState("");
  const [roomsData, setRoomsData] = useState<RoomsDataType[]>(data.rooms || []);
  const {
    bottomDrawerData: { loading },
  } = useSelector(appState);
  const { remontInfo, isOkk } = useSelector(userAppState);

  const {
    remontId,
    isOfflineData,
    master_work_set_media_type_id,
    tasksMode,
    onSubmit: onWorkSubmit,
    workSet,
  } = data;

  const handleUpload = async (roomId: number | string | null = null) => {
    if (loading) return;
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });
      if (result.canceled) return;

      let newFiles = result.assets.map((item) => ({
        ...item,
        name: item.fileName || "",
        type: item.mimeType || "application/octet-stream",
      }));

      if (newFiles?.length) {
        if (roomId) {
          const room = roomsData.find((item) => item.room_id === roomId);
          newFiles = newFiles.filter(
            (item) =>
              !!item && !room?.files?.find((file) => item?.name === file.name)
          );
          setRoomsData((prev) =>
            prev.map((room) => {
              if (room.room_id === roomId)
                return {
                  ...room,
                  files: room.files ? [...room.files, ...newFiles] : newFiles,
                };
              return room;
            })
          );
          return;
        }
        newFiles = newFiles.filter(
          (item) => !!item && !files.find((file) => item?.name === file.name)
        );
        setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {}
  };

  const handleRemoveFile = (
    file: FileType,
    roomId: number | string | null = null,
    checkLoading = true
  ) => {
    if (loading && checkLoading) return;
    if (roomId) {
      setRoomsData((prev) =>
        prev.map((room) => {
          if (room.room_id === roomId)
            return {
              ...room,
              files: room.files?.filter((item) => file.uri !== item.uri),
            };
          return room;
        })
      );
      return;
    }
    setFiles((prev) => {
      return prev.filter((item) => file.uri !== item.uri);
    });
  };

  const getFormDataBody = (file?: FileType | undefined) => {
    if (isOkk) {
      return {
        work_set_id: workSet?.work_set_id,
        comment,
        is_accept: 0,
        team_master_id: workSet?.team_master_id,
        file,
      };
    }
    return {
      work_set_id: data?.work_set_id,
      file,
    };
  };

  const uploadData = async (file: FileType) => {
    if (!remontId || !data?.work_set_id) return;
    let res;
    const formDataBody = getFormDataBody(file);
    if (isOkk) {
      res = await okkCheck(remontId, formDataBody);
    } else if (data.status === workStatuses.NOT_STARTED) {
      res = await beforeWorkCheck(
        remontId,
        formDataBody,
        tasksMode ? workSet?.work_status : null
      );
    } else if (
      data.status === workStatuses.STARTED ||
      data.status === workStatuses.ON_CORRECTION
    ) {
      res = await submitWork(
        remontId,
        formDataBody,
        tasksMode ? workSet?.work_status : null
      );
    }
    if (!res) return;
    handleRemoveFile(file, file.room_id, false);
    if (res === true) return res;
    !tasksMode && dispatch(setRemontInfo(res));
    tasksMode && onWorkSubmit && Array.isArray(res) && onWorkSubmit(res);
    return res;
  };

  const backToHistory = async (workSet?: WorkType | undefined) => {
    if (!remontId) return;
    if (!workSet) return dispatch(closeBottomDrawer());
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.workSetHistory,
        data: {
          workSet: workSet || data.workSet,
          remontId,
          tasksMode,
        },
      })
    );
  };

  const addMedia = !!master_work_set_media_type_id;

  const saveFilesOffline = async () => {
    if (isOfflineData) {
      const allFiles = getAllFiles();
      await generateFilesOfflineActions(
        getFormDataBody(),
        remontId,
        allFiles,
        data.status || workSet?.work_status,
        tasksMode
      );
    }
    let editedRemontInfo: RemontType | null = null;

    const updatedWorkSet = getUpdatedWorkSet(
      data.workSet,
      data.status,
      files,
      roomsData,
      master_work_set_media_type_id || null,
      isOfflineData,
      comment
    );
    await saveOfflineWorkSet(updatedWorkSet);

    if (tasksMode) {
      const updatedTasks = await changeWorkSetTasksData(
        updatedWorkSet,
        data.workSet?.work_status
      );
      onWorkSubmit && onWorkSubmit(updatedTasks);
    } else if (remontInfo) {
      editedRemontInfo = addWorkSetMedia(
        remontInfo,
        roomsData,
        data,
        files,
        master_work_set_media_type_id || null,
        isOfflineData,
        updatedWorkSet,
        comment
      );
      if (editedRemontInfo) dispatch(changeRemontsData(editedRemontInfo));
    }
    showSuccessSnackbar("Успешно");
    if (addMedia) return backToHistory(updatedWorkSet);
    dispatch(closeBottomDrawer());
  };

  const getResponseWorkSet = (
    lastRes?: RemontType | WorkType[] | undefined
  ) => {
    let workSet: WorkType | undefined;
    if (lastRes) {
      if (tasksMode && Array.isArray(lastRes)) {
        workSet = lastRes?.find(
          (work) => work.work_set_id === data.workSet?.work_set_id
        );
      } else if (!tasksMode && !Array.isArray(lastRes)) {
        workSet = lastRes.work_set_info?.find(
          (work) => work.work_set_id === data.workSet?.work_set_id
        );
      }
    }
    return workSet;
  };

  const saveOfflineWorkSet = async (workSet: WorkType | undefined) => {
    if (!remontId) return;
    if (workSet) {
      if (tasksMode) {
        await changeWorkSetData(remontId, workSet);
      } else {
        await changeWorkSetTasksData(workSet);
      }
    }
  };

  const onSubmit = async () => {
    if (loading) return;
    if (isOfflineData) return saveFilesOffline();

    const allFiles = getAllFiles();
    dispatch(setBottomDrawerLoading(true));
    const res: Array<undefined | RemontType | WorkType[] | true> = await Promise.all(
      allFiles.map(async (item) => await uploadData(item))
    );
    dispatch(setBottomDrawerLoading(false));

    let isNetworkError = res?.find((item) => item === true);
    if (isNetworkError) return saveFilesOffline();

    const isFilesHasError = res?.some((item) => !item);
    if (isFilesHasError) return;
    showSuccessSnackbar("Успешно");

    const filledRes = res?.filter((item) => !!item && item !== true);
    //@ts-ignore
    let lastRes: RemontType | WorkType[] = filledRes[filledRes.length - 1];

    const workSet: WorkType | undefined = getResponseWorkSet(lastRes);
    await saveOfflineWorkSet(workSet);

    if (addMedia) return backToHistory(workSet);
    else dispatch(getMenuData(true));
    dispatch(closeBottomDrawer());
  };

  const getAllFiles = () => {
    const roomsWithFiles =
      roomsData?.filter((room) => room.files?.length) || [];
    const roomFiles: FileType[] = getRoomFiles(roomsWithFiles);

    return [...files, ...roomFiles];
  };

  const submitBtnDisabled = useMemo(() => {
    if (loading) return true;
    if (isOkk) return !files.length;
    const isRoomFilesExist = roomsData.find((room) => room.files?.length);
    return !files.length && !isRoomFilesExist;
  }, [files, loading, roomsData, isOkk, comment]);

  const toggleShowRooms = () => {
    setShowRooms((prev) => !prev);
  };

  const onCommentChange = (text: string) => {
    setComment(text);
  };

  const onClose = () => {
    if (addMedia) return backToHistory();
    if (data.onClose) return data.onClose();
    return handleClose();
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        title={
          isOkk
            ? "Отправить на доработку"
            : data.status === workStatuses.NOT_STARTED
            ? "Добавьте медиа-файлы объекта до работы"
            : "Добавьте медиа-файлы проделанной работы, чтобы отправить на проверку"
        }
        handleClose={onClose}
      />
      <FileList
        files={files}
        handleRemoveFile={handleRemoveFile}
        title="Добавьте медиа-файлы"
        handleUpload={handleUpload}
      />

      {!!roomsData?.length && (
        <View>
          <TouchableOpacity onPress={toggleShowRooms} style={styles.roomsBlock}>
            <Text style={styles.roomsBlockTitle}>По комнатам</Text>
            <View style={{ transform: `rotate(${showRooms ? 270 : 90}deg)` }}>
              <Icon name="arrowRight" />
            </View>
          </TouchableOpacity>
          {showRooms && (
            <View>
              {roomsData.map((room) => {
                return (
                  <FileList
                    key={String(room.room_id)}
                    files={room.files || []}
                    title={room.room_name}
                    id={room.room_id}
                    handleRemoveFile={handleRemoveFile}
                    handleUpload={handleUpload}
                  />
                );
              })}
            </View>
          )}
        </View>
      )}

      {isOkk && (
        <TextInput
          style={styles.textarea}
          placeholderTextColor="#888888"
          value={comment}
          multiline
          numberOfLines={5}
          onChangeText={onCommentChange}
          placeholder={"Комментарий"}
        />
      )}
      <CustomButton
        type="contained"
        allWidth
        onClick={onSubmit}
        disabled={submitBtnDisabled}
        title={
          isOkk
            ? "Отправить на доработку"
            : addMedia
            ? "Добавить"
            : getWorkBtnTitle(data.status || "NOT_STARTED")
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 15,
    width: "100%",
    padding: 16,
    flex: 1,
    height: "100%",
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONT.regular,
    marginBottom: 20,
  },
  roomsBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
    padding: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  roomsBlockTitle: {
    fontSize: 16,
    fontFamily: FONT.medium,
    marginBottom: 5,
    marginLeft: 5,
  },
  textarea: {
    height: 108,
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 12,
    padding: 10,
    textAlignVertical: "top",
  },
});
