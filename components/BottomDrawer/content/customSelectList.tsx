import { CustomSelectProps } from "@/components/common/CustomSelect";
import { CustomButton } from "@/components/common/CustomButton";
import { NotFound } from "@/components/common/NotFound";
import { closeBottomDrawer } from "@/services/redux/reducers/app";
import React, { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, TextInput, ScrollView } from "react-native";
import { useDispatch } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { COLORS } from "@/constants";
import { Icon } from "@/components/Icon";

type PropsType = { data: CustomSelectProps; handleClose: () => void };

export const CustomSelectList = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const { list, valueKey, onChange, value, labelKey, disabled, label, placeholder, showResetBtn, showSearch } = data;

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
    
    // Если выбран уже выбранный элемент, сбрасываем выбор
    if (value === selectedId) {
      onChange && onChange(null, null);
    } else {
      onChange && onChange(selectedId, item);
    }
    
    dispatch(closeBottomDrawer());
  };

  const showResetButton = showResetBtn && value;

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        handleClose={handleClose}
        title={label || placeholder || "Выберите.."}
      />
      
      {/* Поле поиска */}
      {showSearch !== false && <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Icon name="search" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск" placeholderTextColor={COLORS.darkGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>}
      
      <ScrollView 
        style={styles.listContainer} 
        contentContainerStyle={[
          styles.listContent,
          showResetButton ? { paddingBottom: 70 } : null
        ]}
        showsVerticalScrollIndicator={false}
      >
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
                    {value === item[valueKey || "id"] && <Icon name = "close" width={18} height={18} stroke={'#242424'} />}
              </Pressable>
            );
          })
        ) : (
          <View style={styles.notFound}>
            <NotFound title="Не найдено" />
          </View>
        )}
      </ScrollView>
      
      {/* Кнопка сброса - закреплена внизу */}
      {showResetButton && (
        <View style={styles.resetButtonContainer}>
          <CustomButton 
            small 
            stylesProps={{minHeight: 50}}
            type="contained" 
            onClick={() => handleChange(null, null)} 
            color={'#BFD0E2'} 
            textStyles={{color: COLORS.primary}} 
            title='Сбросить фильтр'
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: "100%", 
    padding: 16, 
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    marginTop: 15,
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
  listContainer: {
    flex: 1,
    marginTop: 15,
  },
  listContent: {
    flexGrow: 1,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: 'space-between',
    borderRadius: 8
  },
  notFound: {
    paddingVertical: 20,
  },
  resetButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
});
