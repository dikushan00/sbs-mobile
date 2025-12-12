import { useDispatch } from "react-redux";
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/constants";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { Pressable, TextStyle, View } from "react-native";
import { Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useMemo } from "react";
import { Icon } from "../Icon";

export type CustomSelectProps = {
  list: any[];
  onChange: (id: number | null, item: any) => void;
  label?: string;
  valueKey?: string;
  labelKey?: string;
  value?: number | string | null | undefined;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  alt?: boolean;
  placeholder?: string;
  style?: any
  showResetBtn?: boolean
  textStyles?: TextStyle
};
export const CustomSelect = (props: CustomSelectProps) => {
  const dispatch = useDispatch();

  const {label, style, textStyles} = props
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

  const displayText = selectedItem
    ? selectedItem[props.labelKey || "label"]
    : props.placeholder || "Выберите..";

  const isPlaceholder = !selectedItem;

  const styles = style || {}
  return (
    <View>
      {!!label && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 16, color: "#000" }}>{label}</Text>
          {props.required && (
            <Text style={{ color: COLORS.error, marginLeft: 0, fontSize: 16 }}>*</Text>
          )}
        </View>
      )}
      <Pressable
        onPress={openList}
        style={{
          padding: 10,
          paddingHorizontal: 16,
          backgroundColor: props.alt ? COLORS.background : "#f0f0f0",
          borderRadius: 12,
          width: "100%",
          height: 48,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center", 
          ...styles
        }}
      >
        <Text 
          style={{ 
            color: isPlaceholder ? COLORS.darkGray : "#000",
            fontSize: 16, ...textStyles
          }}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {displayText}
        </Text>
        {
          props.alt 
            ? <Icon name="arrowDown" width={16} height={16} fill={COLORS.darkGray} />
            : <FontAwesome5 name="chevron-down" size={14} color={COLORS.black} /> 
        }
        
      </Pressable>
    </View>
  );
};
