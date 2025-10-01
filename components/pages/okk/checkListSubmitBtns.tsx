import { BOTTOM_DRAWER_KEYS } from "@/components/BottomDrawer/services";
import { CustomButton } from "@/components/common/CustomButton";
import { useSnackbar } from "@/components/snackbar/SnackbarContext";
import { COLORS } from "@/constants";
import { AppDispatch } from "@/services/redux";
import {
  closeBottomDrawer,
  showBottomDrawer,
} from "@/services/redux/reducers/app";
import { onSuccessOkkCheck } from "@/services/redux/reducers/userApp";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { CheckListType, sendCheckListCheck } from "./services";

type PropsType = {
  help_call_id: number;
  disabled: boolean;
  data: CheckListType[];
  onSuccess?: () => void;
  loading?: boolean;
  setLoading: (n: boolean) => void;
  params: { resident_id: number | null; entrance: number | null };
};
export const CheckListSubmitBtns = ({
  disabled,
  loading,
  data,
  onSuccess,
  setLoading,
  params,
  help_call_id,
}: PropsType) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const handleCheck = async (checked: boolean) => {
    dispatch(closeBottomDrawer());

    if (!help_call_id) return;
    if (!params.resident_id || !params.entrance) return;
    setLoading(true);
    const res = await Promise.all(
      data?.map(
        async (item) =>
          await sendCheckListCheck(help_call_id, item, checked, dispatch)
      )
    );
    setLoading(false);

    let isNetworkError = res?.find((item) => item === true);

    if (isNetworkError) {
      dispatch(
        onSuccessOkkCheck(params.resident_id, params.entrance, help_call_id)
      );
      onSuccess && onSuccess();
      showSuccessSnackbar("Успешно");
      return;
    }

    const isFilesHasError = res?.some((item) => !item);
    if (isFilesHasError) return;
    dispatch(
      onSuccessOkkCheck(params.resident_id, params.entrance, help_call_id)
    );
    onSuccess && onSuccess();
    showSuccessSnackbar("Успешно");
  };

  const confirmCheck = (checked: boolean) => {
    if (!data?.length) return showErrorSnackbar("Нет чеклистов!");
    if (checked) {
      const isEveryRequiredChecked = data
        ?.filter((item) => item.is_required)
        .every((item) => item.check_list_is_accepted === "1");
      if (!isEveryRequiredChecked)
        return showErrorSnackbar(
          "При принятии работ, все обязательные чеклисты должны быть приняты"
        );
    }

    if (!checked) {
      const isRejectedPointsExist = !!data?.filter((item) =>
        item.points?.some((pt) => pt.point_is_accepted === "0")
      )?.length;
      if (!isRejectedPointsExist)
        return showErrorSnackbar("Отсутствуют замечания!");
    }

    const nonCheckedCheckLists = data?.filter(
      (item) => !item.check_list_is_accepted
    );
    if (nonCheckedCheckLists?.length) {
      return showErrorSnackbar(
        `Чеклист: ${nonCheckedCheckLists[0].check_name} не принят, но отсутсвуют замечания`
      );
    }

    const rejectedCheckLists = data?.filter(
      (item) => item.check_list_is_accepted === "0"
    );
    if (rejectedCheckLists?.length) {
      const checkListsWithoutPoints = rejectedCheckLists?.filter(
        (item) =>
          !item.points?.filter((point) => point?.point_is_accepted === "0")
            ?.length
      );

      if (checkListsWithoutPoints?.length)
        return showErrorSnackbar(
          `Чеклист: ${checkListsWithoutPoints[0].check_name} не принят, но отсутсвуют замечания`
        );
    }

    const approvedCheckLists = data?.filter(
      (item) => item.check_list_is_accepted === "1"
    );
    if (approvedCheckLists?.length) {
      const checkListsWithPoints = approvedCheckLists?.filter(
        (item) =>
          !!item.points?.filter((point) => point?.point_is_accepted === "0")
            ?.length
      );
      if (checkListsWithPoints?.length)
        return showErrorSnackbar(
          `Чеклист: ${checkListsWithPoints[0].check_name} принят, но у него есть замечания`
        );
    }

    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.confirm,
        data: {
          title: checked
            ? "Вы действительно хотите принять работу?"
            : "Вы действительно хотите отклонить работу?",
          submitBtnText: "Подтвердить",
          onSubmit: () => handleCheck(checked),
        },
      })
    );
  };
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
      }}
    >
      <CustomButton
        type="contained"
        color={COLORS.success}
        onClick={() => confirmCheck(true)}
        small
        disabled={disabled || loading}
      >
        <FontAwesome5 name="thumbs-up" size={18} color={COLORS.white} />
      </CustomButton>
      <CustomButton
        type="contained"
        onClick={() => confirmCheck(false)}
        small
        color={COLORS.error}
        disabled={disabled || loading}
      >
        <FontAwesome5 name="thumbs-down" size={18} color={COLORS.white} />
      </CustomButton>
    </View>
  );
};
