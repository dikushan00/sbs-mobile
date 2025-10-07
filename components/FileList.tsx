import { apiUrl, COLORS, FONT, SHADOWS } from "@/constants";
import { AppDispatch } from "@/services/redux";
import { showModal } from "@/services/redux/reducers/app";
import { getMediaTypeByExtension } from "@/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { CustomImage } from "./common/CustomImage";
import { Icon } from "./Icon";
import { MODAL_NAMES } from "./Modal/services";
import { VideoComponent } from "./slider";
import { FileType } from "@/services/types";

type FileListProps = {
  title?: string;
  files: FileType[];
  handleRemoveFile?: (file: FileType, id: number | string | null) => void;
  handleUpload?: (id: number | string | null) => void;
  handleCheck?: (id: number | string | null, i: number, value: boolean) => void;
  id?: number | string;
  checkboxMode?: boolean;
  addBackground?: boolean;
  galleryMode?: boolean;
  addMode?: boolean;
};

export const FileList = ({
  files,
  handleRemoveFile,
  handleUpload,
  handleCheck,
  title,
  id,
  checkboxMode,
  addBackground = true,
  addMode = true,
  galleryMode = false,
}: FileListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const WrapperComponent = checkboxMode ? TouchableOpacity : View;

  const imageClick = (i: number, files: FileType[]) => {
    dispatch(
      showModal({
        type: MODAL_NAMES.gallery,
        data: {
          activeIndex: i,
          files: files?.map((item) => ({ file_url: item.uri })),
        },
      })
    );
  };

  const computedFiles = useMemo(() => {
    return files?.map((item) =>
      typeof item === "string"
        ? {
            uri: `${apiUrl}/${item}`,
            deletable: false,
            checked: false,
            desc: "",
            name: "",
            type: "",
          }
        : item
    );
  }, [files]);

  return (
    <View
      style={
        id
          ? {
              marginTop: 15,
              backgroundColor: addBackground ? "#f9f9f9" : "",
              padding: addBackground ? 5 : 0,
              borderRadius: 5,
              paddingHorizontal: addBackground ? 10 : 0,
            }
          : {}
      }
    >
      {!!title && <Text style={styles.fileListTitle}>{title}</Text>}
      <View
        style={{
          flexDirection: "row",
          gap: checkboxMode ? 10 : 16,
          flexWrap: "wrap",
        }}
      >
        {computedFiles.map((item, i) => {
          return (
            item?.uri && (
              <WrapperComponent
                style={
                  id
                    ? {
                        ...styles.imageWrapper,
                        ...styles.smallImageWrapper,
                      }
                    : styles.imageWrapper
                }
                key={item.uri}
                onPress={() =>
                  checkboxMode &&
                  handleCheck &&
                  handleCheck(id || null, i, !item?.checked)
                }
              >
                {getMediaTypeByExtension(item.uri) === "video" ? (
                  <VideoComponent
                    src={item.uri || ""}
                    style={styles.video}
                    canPlay={false}
                    onClick={
                      galleryMode
                        ? () => imageClick(i, computedFiles)
                        : undefined
                    }
                  />
                ) : (
                  <CustomImage
                    src={item.uri}
                    style={styles.image}
                    onClick={
                      galleryMode
                        ? () => imageClick(i, computedFiles)
                        : undefined
                    }
                  />
                )}

                {!!item.desc && (
                  <Text style={styles.roomDesc}>{item.desc}</Text>
                )}
                {handleRemoveFile && addMode && item.deletable !== false && (
                  <TouchableOpacity
                    style={styles.removeWrapper}
                    onPress={() => handleRemoveFile(item, id || null)}
                  >
                    <Icon name="closeCircleRed" />
                  </TouchableOpacity>
                )}
                {checkboxMode && (
                  <TouchableOpacity
                    style={styles.checkboxWrapper}
                    onPress={() =>
                      handleCheck && handleCheck(id || null, i, !item?.checked)
                    }
                  >
                    {!!item?.checked && (
                      <FontAwesome5
                        name="check-circle"
                        size={22}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </WrapperComponent>
            )
          );
        })}
        {handleUpload && addMode && (
          <TouchableOpacity
            onPress={() => handleUpload(id || null)}
            style={
              id
                ? {
                    ...styles.pickerItemWrapper,
                    ...styles.pickerSmallItemWrapper,
                  }
                : styles.pickerItemWrapper
            }
          >
            <View style={styles.pickerItem}>
              <Icon name="addCircle" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fileListTitle: {
    fontSize: 15,
    fontFamily: FONT.medium,
    marginBottom: 8,
    marginLeft: 5,
    color: "#404040",
  },
  pickerItemWrapper: {
    width: "30%",
    height: 144,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pickerSmallItemWrapper: {
    width: "22%",
    height: 110,
  },
  pickerItem: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.primaryBackground,
  },
  imageWrapper: {
    position: "relative",
    width: "30%",
    height: 144,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBackground,
  },
  smallImageWrapper: {
    width: "22%",
    height: 110,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: COLORS.primaryBackground,
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: COLORS.primaryBackground,
  },
  removeWrapper: {
    position: "absolute",
    top: -12,
    right: -12,
    height: 32,
    width: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: "50%",
  },
  checkboxWrapper: {
    position: "absolute",
    top: -8,
    right: -8,
    height: 26,
    width: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: "50%",
    ...SHADOWS.small,
  },
  roomDesc: {
    paddingLeft: 3,
    marginTop: 2,
    fontSize: 11,
  },
});
