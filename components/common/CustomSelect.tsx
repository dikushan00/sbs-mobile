import { useDispatch } from "react-redux";
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/services";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { Pressable, View } from "react-native";
import { Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useMemo } from "react";

export type CustomSelectProps = {
  list: any[];
  onChange: (id: number | null, item: any) => void;
  label?: string;
  valueKey?: string;
  labelKey?: string;
  value?: number | string | null | undefined;
  isLoading?: boolean;
  disabled?: boolean;
};
export const CustomSelect = (props: CustomSelectProps) => {
  const dispatch = useDispatch();

  const openList = async () => {
    if (props.disabled || !props.list?.length) return;
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.customSelectList,
        data: {
          ...props,
        },
      })
    );
  };

  const selectedItem = useMemo(() => {
    if (!props.value || !props.list?.length) return null;
    return props.list?.find(
      (item) => item[props.valueKey || "id"] === props.value
    );
  }, [props.list, props.value, props.valueKey]);

  return (
    <View>
      <Pressable
        onPress={openList}
        style={{
          padding: 10,
          backgroundColor: "#f0f0f0",
          borderRadius: 5,
          width: "100%",
          height: 40,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text>
          {selectedItem
            ? selectedItem[props.labelKey || "label"]
            : props?.label || "Выберите.."}
        </Text>
        <FontAwesome5 name="chevron-down" size={14} color={COLORS.black} />
      </Pressable>
    </View>
  );
};
