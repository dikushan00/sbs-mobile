import { useDispatch } from "react-redux";
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/constants";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { Pressable, View } from "react-native";
import { Text } from "react-native";
import { COLORS } from "@/constants";
import { WorkSetType } from "@/components/main/types";
import { Icon } from "../Icon";

export type WorkSetSelectProps = {
  list: WorkSetType[];
  onChange: (id: number | null, item: WorkSetType | null) => void;
  label?: string;
  value?: WorkSetType | null;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  workSetGroups?: any[]; // Добавляем группы для accordion
};

export const WorkSetSelect = (props: WorkSetSelectProps) => {
  const dispatch = useDispatch();

  const { label } = props;
  
  const openList = async () => {
    if (props.disabled || !props.list?.length) return;
    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.workSetSelectList,
        data: {
          ...props,
        } as any,
      })
    );
  };

  const displayText = props.value
    ? props.value.work_set_name.length > 30 
      ? props.value.work_set_name.substring(0, 30) + "..."
      : props.value.work_set_name
    : props.placeholder || "Выберите конструктив..";

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
