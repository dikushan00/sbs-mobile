import { BlockWrapper } from "@/components/common/BlockWrapper";
import { CustomButton } from "@/components/common/CustomButton";
import { FileList } from "@/components/FileList";
import { getCurrentOkkMedia, okkCheck } from "@/components/pages/okk/services";
import {
  addWorkSetMedia,
  changeWorkSetTasksData,
  getUpdatedWorkSet,
  refactorWorkSetMedia,
} from "@/components/pages/remonts/services";
import { WorkSetMediaType } from "@/components/pages/remonts/types";
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { COLORS } from "@/constants";
import {
  setBottomDrawerLoading,
  showBottomDrawer,
} from "@/services/redux/reducers/app";
import {
  changeRemontsData,
  setRemontInfo,
  userAppState,
} from "@/services/redux/reducers/userApp";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { BOTTOM_DRAWER_KEYS } from "../services";
import { WorkReportDrawerType } from "../types";
import { AppDispatch } from "@/services/redux";

type PropsType = { data: WorkReportDrawerType; handleClose: () => void };
export const WorkReport = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccessSnackbar } = useSnackbar();
  const [currentMedia] = useState<WorkSetMediaType | null>(
    getCurrentOkkMedia(refactorWorkSetMedia(data?.media))
  );
  const { remontInfo } = useSelector(userAppState);

  const onAcceptWork = async () => {
    const body = {
      work_set_id: data.work_set_id,
      remont_id: data.remontId,
      comment: "",
      is_accept: 1,
      team_master_id: data.team_master_id,
    };

    dispatch(setBottomDrawerLoading(true));
    const res = await okkCheck(data.remontId, body);
    dispatch(setBottomDrawerLoading(false));
    if (!res) return;
    showSuccessSnackbar("Работа принята");

    if (res === true) {
      if (!remontInfo) return;
      const updatedWorkSet = getUpdatedWorkSet(
        data.workSet,
        data.work_status,
        null,
        [],
        null,
        false,
        "",
        false
      );
      await changeWorkSetTasksData(updatedWorkSet);
      const editedRemontInfo = addWorkSetMedia(
        remontInfo,
        [],
        {
          work_set_id: updatedWorkSet.work_set_id,
          status: updatedWorkSet.work_status,
        },
        null,
        null,
        false,
        updatedWorkSet,
        ""
      );
      if (editedRemontInfo) dispatch(changeRemontsData(editedRemontInfo));
      return handleClose();
    }
    dispatch(setRemontInfo(res));
    handleClose();
  };

  const handleAccept = () => {
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.confirm,
        data: {
          title: "Вы действительно хотите принять работу?",
          submitBtnText: "Да, принять",
          onSubmit: onAcceptWork,
          onClose: () =>
            dispatch(
              showBottomDrawer({
                type: BOTTOM_DRAWER_KEYS.workReport,
                data: data,
              })
            ),
        },
      })
    );
  };

  const handleReject = () => {
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.uploadMediaCheck,
        data: {
          remontId: data?.remontId || null,
          work_set_id: data.work_set_id,
          workSet: data.workSet,
          onClose: () =>
            dispatch(
              showBottomDrawer({
                type: BOTTOM_DRAWER_KEYS.workReport,
                data,
              })
            ),
        },
      })
    );
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        handleClose={handleClose}
        title={data?.work_set_name}
      />
      {currentMedia && (
        <BlockWrapper
          title={currentMedia.master_work_set_media_type_name}
          desc={`(${currentMedia.date || ""})`}
          renderIcon={
            currentMedia.isOfflineData
              ? () => (
                  <FontAwesome5
                    name="sync-alt"
                    size={14}
                    color={COLORS.warning}
                  />
                )
              : undefined
          }
          style={{ padding: 0, paddingBottom: 25 }}
          small
        >
          <FileList
            files={
              currentMedia?.files?.map((file) => ({
                name: "",
                desc: file.desc || "",
                type: "",
                uri: file.url,
                file: null,
                checked: file.checked,
              })) || []
            }
            id={currentMedia.id}
            galleryMode
            addBackground={false}
          />
        </BlockWrapper>
      )}
      <CustomButton
        type="contained"
        onClick={handleAccept}
        title={"Принять работу"}
      />
      <CustomButton
        type="outlined"
        onClick={handleReject}
        title={"Отправить на проверку"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 15, width: "100%", padding: 16 },
});
