import { CustomSelectProps } from "@/components/common/CustomSelect";
import { CustomButton } from "@/components/common/CustomButton";
import { NotFound } from "@/components/common/NotFound";
import { closeBottomDrawer } from "@/services/redux/reducers/app";
import React, { useState, useMemo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, TextInput, ScrollView, Dimensions, Keyboard } from "react-native";
import { useDispatch } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { COLORS } from "@/constants";
import { Icon } from "@/components/Icon";

type PropsType = { 
  data: CustomSelectProps & { 
    snapToPosition?: (position: number) => void;
    snapToIndex?: (index: number) => void;
  }; 
  handleClose: () => void 
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CustomSelectList = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const { list, valueKey, onChange, value, labelKey, disabled, label, placeholder, showResetBtn, showSearch, snapToPosition, snapToIndex } = data;

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  // Фильтруем список по поисковому запросу
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list || [];
    
    return (list || []).filter((item) => {
      const itemLabel = item[labelKey || "label"] || "";
      return itemLabel.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [list, searchQuery, labelKey]);

  // Изменяем высоту drawer при вводе в поле поиска
  useEffect(() => {
    if (searchQuery.trim()) {
      // При вводе - на всю высоту экрана (позиция от низа экрана)
      if (snapToPosition) {
        snapToPosition(SCREEN_HEIGHT);
      }
    } else {
      // При очистке - возвращаем к исходному snapPoint
      if (snapToIndex) {
        snapToIndex(0);
      }
    }
  }, [searchQuery, snapToPosition, snapToIndex]);

  // Отслеживаем закрытие клавиатуры и возвращаем высоту к исходной
  useEffect(() => {
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (e) => {
      console.log(e);
        // При закрытии клавиатуры возвращаем к исходному snapPoint только если поле поиска пустое
        if (!searchQuery.trim() && snapToIndex) {
          snapToIndex(0);
        }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [snapToIndex, searchQuery]);

  const handleChange = (selectedId: number | null, item: any) => {
    if (disabled) return;
    
    Keyboard.dismiss();
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
        keyboardShouldPersistTaps="handled"
      >
        {filteredList?.length ? (
          filteredList?.map((item, i) => {
            return (
              <Pressable
                style={({ pressed }) => ({
                  ...styles.item,
                  backgroundColor: pressed 
                    ? "rgba(0, 108, 255, 0.05)" 
                    : value === item[valueKey || "id"] 
                      ? "rgba(0, 108, 255, 0.1)" 
                      : "#fff",
                  opacity: pressed ? 0.8 : 1,
                })}
                key={String(item[valueKey || "id"])}
                onPress={() => {
                  if (!disabled) {
                    handleChange(item[valueKey || "id"], item);
                  }
                }}
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
    minHeight: 0,
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
