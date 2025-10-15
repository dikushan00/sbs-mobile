import { CustomSelectProps } from "@/components/common/CustomSelect";
import { CustomButton } from "@/components/common/CustomButton";
import { NotFound } from "@/components/common/NotFound";
import { closeBottomDrawer } from "@/services/redux/reducers/app";
import React, { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { useDispatch } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { COLORS } from "@/constants";
import { Icon } from "@/components/Icon";

type PropsType = { data: CustomSelectProps; handleClose: () => void };

export const CustomSelectList = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const { list, valueKey, onChange, value, labelKey, disabled, label, placeholder } = data;

  // Фильтруем список по поисковому запросу
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list || [];
    
    return (list || []).filter((item) => {
      const itemLabel = item[labelKey || "label"] || "";
      return itemLabel.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [list, searchQuery, labelKey]);

  const handleChange = (selectedId: number | null, item: any) => {
    if (disabled) return;
    onChange && onChange(selectedId, item);
    dispatch(closeBottomDrawer());
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        handleClose={handleClose}
        title={label || placeholder || "Выберите.."}
      />
      
      {/* Поле поиска */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Icon name="search" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View>
        {filteredList?.length ? (
          filteredList?.map((item, i) => {
            return (
              <Pressable
                style={{
                  ...styles.item,
                  backgroundColor:
                    value === item[valueKey || "id"] ? "rgba(0, 108, 255, 0.1)" : "#fff",
                }}
                key={String(item[valueKey || "id"])}
                onPress={() =>
                  !disabled && handleChange(item[valueKey || "id"], item)
                }
              >
                <Text style={{fontSize: 16, color: 
                    value === item[valueKey || "id"] ? COLORS.primaryLight : "#000",}}>{item[labelKey || "label"] || ""}</Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.notFound}>
            <NotFound title="Не найдено" />
          </View>
        )}
        <CustomButton small stylesProps={{marginTop: 15, minHeight: 50}}
        type="contained" onClick={() => handleChange(null, null)} color={COLORS.error} title='Сбросить'>

        </CustomButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 15, width: "100%", padding: 16, paddingBottom: 50 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchIconText: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 8
  },
  notFound: {
    paddingVertical: 20,
  },
});
