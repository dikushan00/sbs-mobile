import { FlatSelectProps } from "@/components/common/FlatSelect";
import { closeBottomDrawer } from "@/services/redux/reducers/app";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { COLORS } from "@/constants";
import { FlatType } from "@/components/main/types";

type PropsType = { data: FlatSelectProps; handleClose: () => void };

export const FlatSelectList = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch();

  const { list, onChange, value, disabled, label } = data;

  const handleChange = (flat: FlatType | null) => {
    if (disabled) return;
    
    // Если кликнули на уже выбранную квартиру - сбрасываем выбор
    if (value && flat && value.flat_id === flat.flat_id) {
      onChange && onChange(null, null);
    } else {
      onChange && onChange(flat?.flat_id || null, flat);
    }
    
    dispatch(closeBottomDrawer());
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        handleClose={handleClose}
        title={label || "Выберите квартиру"}
      />
      
      <View>
        {list?.length ? (
          list?.map((flat) => {
            const isSelected = value?.flat_id === flat.flat_id;
            return (
              <Pressable
                style={{
                  ...styles.item,
                  backgroundColor: isSelected ? "#ddd" : "#fff",
                }}
                key={String(flat.flat_id)}
                onPress={() => !disabled && handleChange(flat)}
              >
                <View style={styles.itemContent}>
                  <Text style={styles.flatNumber}>
                    Квартира {flat.flat_num}
                    {isSelected && " (нажмите для сброса)"}
                  </Text>
                  {!!flat.area && <Text style={styles.flatInfo}>
                    Площадь: {flat.area} м² • Комнат: {flat.room_cnt}
                  </Text>}
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Квартиры не найдены</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    gap: 15, 
    width: "100%", 
    padding: 16, 
    paddingBottom: 50 
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 8,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
  },
  flatNumber: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  flatInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
