import { CustomButton } from "@/components/common/CustomButton";
import { FileList } from "@/components/FileList";
import { COLORS, FONT } from "@/constants";
import { AppDispatch } from "@/services/redux";
import {
  appState,
  closeBottomDrawer,
  setBottomDrawerLoading,
} from "@/services/redux/reducers/app";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { UploadMediaDrawerType } from "../types";
import { FontAwesome5 } from "@expo/vector-icons";
import { PointType } from "@/components/pages/okk/services";
import { Modal, Portal } from "react-native-paper";
import uuid from "react-native-uuid";
import { FileType } from "@/services/types";

type PropsType = { data: UploadMediaDrawerType; handleClose: () => void };

export const UploadMedia = ({ data, handleClose }: PropsType) => {
  const dispatch: AppDispatch = useDispatch();
  const [files, setFiles] = useState<FileType[]>(
    data?.files ? [...data.files] : []
  );
  const [generatedPointId] = useState(uuid.v4());
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  const [comment, setComment] = useState(data?.comment ? data?.comment : "");
  const { showTextarea, pointData, onDelete } = data;
  const [accepted, setAccepted] = useState(
    getAcceptedValue(data?.accepted, pointData)
  );
  const [visible, setVisible] = useState(false);

  const {
    bottomDrawerData: { loading },
  } = useSelector(appState);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleUpload = async (isCamera = false) => {
    if (loading) return;

    if (isCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Необходимо разрешение для доступа к камере!");
        return;
      }
    } else {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) return;
    }

    try {
      let result;
      if (isCamera) {
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: false,
          aspect: [16, 9],
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: false,
          quality: 1,
          allowsMultipleSelection: true,
          selectionLimit: 10,
        });
      }

      if (!result || result?.canceled) return;

      let newFiles = result?.assets?.map((item) => ({
        ...item,
        name: item.fileName || "",
        type: item.mimeType || "application/octet-stream",
      }));

      if (newFiles && newFiles?.length) {
        onSubmit([...files, ...newFiles]);
        newFiles = newFiles?.filter(
          (item) => !!item && !files.find((file) => item?.name === file.name)
        );
        newFiles && setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {}
  };

  const handleRemoveFile = (
    file: FileType,
    _: number | string | null,
    checkLoading = true
  ) => {
    if (loading && checkLoading) return;
    const filesEdited = files?.filter((item) => file.uri !== item.uri);
    setFiles(filesEdited || []);
    onSubmit(filesEdited, false);
  };

  const onSubmit = async (
    argFiles: FileType[] | undefined = undefined,
    closeDrawer = false,
    acceptedArg: boolean | undefined = undefined
  ) => {
    if (loading) return;
    dispatch(setBottomDrawerLoading(true));
    data.onSubmit &&
      (await data.onSubmit(
        argFiles || files,
        comment,
        acceptedArg !== undefined ? acceptedArg : accepted,
        generatedPointId
      ));
    dispatch(setBottomDrawerLoading(false));
    closeDrawer && dispatch(closeBottomDrawer());
  };

  const submitBtnDisabled = useMemo(() => {
    if (loading) return true;
    return !files.length;
  }, [files, loading]);

  const onCommentChange = (text: string) => {
    setShowSubmitBtn(true);
    setComment(text);
  };

  const handleAcceptedChange = async (status: boolean) => {
    await Alert.alert(
      "Вы дейтсвительно хотите принять работу?",
      "",
      [
        {
          text: "НЕТ",
          onPress: () => {},
        },
        {
          text: "ДА",
          onPress: () => {
            setAccepted(status);
            onSubmit(undefined, false, status);
          },
        },
      ],
      { cancelable: true, onDismiss: () => {} }
    );
  };

  const onClose = () => {
    if (data?.onClose) return data.onClose();
    return handleClose();
  };
  const containerStyle = {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    marginLeft: 10,
    marginRight: 10,
  };

  return (
    <View style={styles.container}>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>Загрузить с помощью:</Text>
            <TouchableOpacity onPress={hideModal} style={{ padding: 5 }}>
              <FontAwesome5 size={20} name="times" color={"#404040"} />
            </TouchableOpacity>
          </View>
          <View style={styles.chooseWrapper}>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => {
                  hideModal();
                  handleUpload();
                }}
                style={styles.chooseItem}
              >
                <FontAwesome5
                  name="images"
                  color={COLORS.primary}
                  style={{ fontSize: 24 }}
                />
              </TouchableOpacity>
              <Text style={styles.chooseLabel}>Галерея</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => {
                  hideModal();
                  handleUpload(true);
                }}
                style={styles.chooseItem}
              >
                <FontAwesome5
                  name="camera"
                  color={COLORS.primary}
                  style={{ fontSize: 24 }}
                />
              </TouchableOpacity>
              <Text style={styles.chooseLabel}>Камера</Text>
            </View>
          </View>
        </Modal>
      </Portal>
      <BottomDrawerHeader
        title={
          pointData?.call_check_list_point_id ? "Замечание" : "Загрузить файлы"
        }
        handleClose={onClose}
      />

      {data.isEditable !== false && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: pointData?.call_check_list_point_id
              ? "space-between"
              : "flex-end",
            paddingRight: 15,
          }}
        >
          {!!pointData?.call_check_list_point_id && (
            <View
              style={{
                flexDirection: "row",
                gap: 5,
              }}
            >
              <CustomButton
                type={accepted === true ? "contained" : "outlined"}
                color={accepted === true ? COLORS.green : COLORS.gray2}
                onClick={() => handleAcceptedChange(true)}
                small
              >
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesome5
                    name="thumbs-up"
                    style={{
                      fontSize: 18,
                      color: accepted === true ? COLORS.white : COLORS.black,
                    }}
                  />
                </View>
              </CustomButton>
            </View>
          )}
          {!pointData?.call_check_list_point_id && onDelete && (
            <CustomButton
              stylesProps={{ width: 50, height: 35 }}
              type="contained"
              small
              color={COLORS.error}
              onClick={() => onDelete && pointData && onDelete(pointData)}
            >
              <FontAwesome5
                name="trash-alt"
                style={{ color: "#fff", fontSize: 20 }}
              />
            </CustomButton>
          )}
        </View>
      )}

      <FileList
        files={files || []}
        // addMode={data.isEditable !== false}
        addMode
        handleRemoveFile={handleRemoveFile}
        title={
          pointData?.call_check_list_point_id
            ? files?.length
              ? "Медиа файлы"
              : ""
            : "Добавьте медиа-файлы"
        }
        handleUpload={showModal}
        galleryMode
      />

      {data.isEditable === false && (
        <View style={{ paddingBottom: 20 }}>
          <Text style={styles.blockTitle}>Комментарий:</Text>
          <Text style={{ paddingLeft: 10 }}>{comment || "sdfsdf"}</Text>
        </View>
      )}

      {showTextarea && data.isEditable !== false && (
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
      {!!showSubmitBtn && (
        <CustomButton
          type="contained"
          allWidth
          onClick={() => onSubmit(undefined, true)}
          disabled={submitBtnDisabled}
          title={"Сохранить"}
        />
      )}
    </View>
  );
};
const getAcceptedValue = (
  accepted: "1" | "0" | null | undefined,
  pointData: PointType | undefined
) => {
  if (!pointData?.call_check_list_point_id) return false;
  if (accepted === "1") return true;
  if (accepted === "0") return false;
  return null;
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
  textarea: {
    height: 108,
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 12,
    padding: 10,
    textAlignVertical: "top",
  },
  blockTitle: {
    fontSize: 15,
    fontFamily: FONT.medium,
    marginBottom: 8,
    marginLeft: 5,
    color: "#404040",
  },
  chooseItem: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    padding: 20,
    borderRadius: 5,
  },
  chooseWrapper: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
    width: "100%",
    justifyContent: "center",
  },
  chooseLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 500,
  },
});
