import { useDispatch } from "react-redux";
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/services";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { Pressable, View } from "react-native";
import { Text } from "react-native";
import { COLORS } from "@/constants";
import { FlatType } from "@/components/main/types";
import { Icon } from "../Icon";

export type FlatSelectProps = {
  list: FlatType[];
  onChange: (id: number | null, item: FlatType | null) => void;
  label?: string;
  value?: FlatType | null;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
};

export const FlatSelect = (props: FlatSelectProps) => {
  const dispatch = useDispatch();

  const { label } = props;
  
  const openList = async () => {
    if (props.disabled || !props.list?.length) return;
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.flatSelectList,
        data: {
          ...props,
        } as any,
      })
    );
  };

  const displayText = props.value
    ? `Квартира ${props.value.flat_num}`
    : props.placeholder || "Выберите квартиру..";

  const isPlaceholder = !props.value;

  return (
    <View>
      {!!label && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 16, color: "#333" }}>{label}</Text>
          {props.required && (
            <Text style={{ color: COLORS.error, marginLeft: 0, fontSize: 16 }}>*</Text>
          )}
        </View>
      )}
      <Pressable
        onPress={openList}
        style={{
          padding: 10,
          paddingHorizontal: 15,
          backgroundColor: props.value ? COLORS.primaryLight : "#f0f0f0",
          borderRadius: 12,
          width: "100%",
          height: 48,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text 
          style={{ 
            color: props.value ? "#fff" : (isPlaceholder ? "#757575" : "#333"),
            fontSize: 16,
            flex: 1
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayText}
        </Text>
        <Icon name="arrowDown"
          fill={props.value ? "#fff" : COLORS.darkGray} width={14} height={14}  />
      </Pressable>
    </View>
  );
};
