import { CustomSelectProps } from "@/components/common/CustomSelect";
import { CustomButton } from "@/components/common/CustomButton";
import { NotFound } from "@/components/common/NotFound";
import { closeBottomDrawer } from "@/services/redux/reducers/app";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { COLORS } from "@/constants";

type PropsType = { data: CustomSelectProps; handleClose: () => void };

export const CustomSelectList = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch();

  const { list, valueKey, onChange, value, labelKey, disabled, label } = data;

  const handleChange = (selectedId: number | null, item: any) => {
    if (disabled) return;
    onChange && onChange(selectedId, item);
    dispatch(closeBottomDrawer());
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        handleClose={handleClose}
        title={label || "Выберите.."}
      />
      <View>
        {list?.length ? (
          list?.map((item, i) => {
            return (
              <Pressable
                style={{
                  ...styles.item,
                  borderBottomWidth: (list?.length || 0) - 1 === i ? 1 : 0,
                  borderTopWidth: i === 0 ? 0 : 1,
                  backgroundColor:
                    value === item[valueKey || "id"] ? "#ddd" : "#fff",
                }}
                key={String(item[valueKey || "id"])}
                onPress={() =>
                  !disabled && handleChange(item[valueKey || "id"], item)
                }
              >
                <Text>{item[labelKey || "label"] || ""}</Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.notFound}>
            <NotFound title="Не найдено" />
          </View>
        )}
        <CustomButton small stylesProps={{marginTop: 15, minHeight: 40}}
        type="contained" onClick={() => handleChange(null, null)} color={COLORS.error} title='Сбросить'>

        </CustomButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 15, width: "100%", padding: 16 },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    alignItems: "center",
    flexDirection: "row",
  },
  notFound: {
    paddingVertical: 20,
  },
});
