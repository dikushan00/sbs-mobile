import { WorkSetSelectProps } from "@/components/common/WorkSetSelect";
import { closeBottomDrawer } from "@/services/redux/reducers/app";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { COLORS } from "@/constants";
import { WorkSetType, WorkSetCheckGroupType, FloorMapWorkSetType } from "@/components/main/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { Icon } from "@/components/Icon";

type WorkSetSelectListProps = {
  list: WorkSetType[];
  onChange: (id: number | null, item: WorkSetType | null) => void;
  label?: string;
  value?: WorkSetType | null;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  workSetGroups?: any[];
};

type PropsType = { data: WorkSetSelectListProps; handleClose: () => void };

export const WorkSetSelectList = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Сохраняем состояние раскрытых элементов в AsyncStorage
  const saveExpandedState = async (expanded: Set<string>) => {
    try {
      const expandedArray = Array.from(expanded);
      await AsyncStorage.setItem('workSetExpandedGroups', JSON.stringify(expandedArray));
    } catch (error) {
      console.log('Error saving expanded state:', error);
    }
  };

  // Загружаем состояние раскрытых элементов из AsyncStorage
  const loadExpandedState = async (): Promise<Set<string>> => {
    try {
      const saved = await AsyncStorage.getItem('workSetExpandedGroups');
      if (saved) {
        const expandedArray: string[] = JSON.parse(saved);
        return new Set(expandedArray);
      }
    } catch (error) {
      console.log('Error loading expanded state:', error);
    }
    return new Set<string>();
  };

  // Инициализируем состояние при загрузке
  React.useEffect(() => {
    const initializeExpandedState = async () => {
      const savedState = await loadExpandedState();
      setExpandedGroups(savedState);
    };
    initializeExpandedState();
  }, []);

  const { list, onChange, value, disabled, label, workSetGroups = [] } = data;

  const handleChange = (workSet: WorkSetType | null) => {
    if (disabled) return;
    
    // Если кликнули на уже выбранный конструктив - сбрасываем выбор
    if (value && workSet && value.work_set_id === workSet.work_set_id) {
      onChange && onChange(null, null);
    } else {
      onChange && onChange(workSet?.work_set_id || null, workSet);
    }
    
    dispatch(closeBottomDrawer());
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
    saveExpandedState(newExpanded);
  };

  const renderWorkSetItem = (workSet: WorkSetType) => {
    const isSelected = value?.work_set_id === workSet.work_set_id;
    
    return (
      <Pressable
        style={[
          styles.workSetItem,
          isSelected && {
            backgroundColor: "#ddd",
          }
        ]}
        key={workSet.work_set_id}
        onPress={() => !disabled && handleChange(workSet)}
      >
        <View style={styles.workSetContent}>
          <View style={styles.workSetInfo}>
            <Text style={styles.workSetName}>
              {workSet.work_set_name}
              {isSelected && " (нажмите для сброса)"}
            </Text>
          </View>
          <View style={styles.radioContainer}>
            <View style={[
              styles.radio,
              isSelected && styles.radioSelected
            ]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderPlacementType = (placementType: any) => {
    const placementKey = `placement_${placementType.placement_type_id}`;
    const isExpanded = expandedGroups.has(placementKey);
    
    return (
      <View key={placementType.placement_type_id} style={styles.placementTypeContainer}>
        <Pressable
          style={styles.placementTypeHeader}
          onPress={() => toggleGroup(placementKey)}
        >
          <Icon 
            name={isExpanded ? "arrowDown" : "arrowRightBlack"} 
            width={isExpanded ? 14 : 13} 
            height={isExpanded ? 14 : 13} fill="#000"
          />
          <Text style={styles.placementTypeTitle}>{placementType.placement_type_name}</Text>
        </Pressable>
        
        {isExpanded && (
          <View style={styles.placementTypeContent}>
            {placementType.work_set_check_groups.map((group: any) => renderGroup(group, placementType.placement_type_id))}
          </View>
        )}
      </View>
    );
  };

  const renderGroup = (group: WorkSetCheckGroupType, placement_type_id: number) => {
    const groupKey = `group_${group.work_set_check_group_id}_${placement_type_id}`;
    const isExpanded = expandedGroups.has(groupKey);
    
    return (
      <View key={groupKey} style={styles.group}>
        <Pressable
          style={styles.groupHeader}
          onPress={() => toggleGroup(groupKey)}
        >   
          <Icon 
            name={isExpanded ? "arrowDown" : "arrowRightBlack"} 
            width={isExpanded ? 14 : 13} 
            height={isExpanded ? 14 : 13} 
          />
          <Text style={styles.groupTitle}>{group.work_set_check_group_name}</Text>
        </Pressable>
        
        {isExpanded && (
          <View style={styles.groupContent}>
            {group.work_sets.map(renderWorkSetItem)}
          </View>
        )}
      </View>
    );
  };

  // Создаем правильную иерархию: placement_type -> work_set_check_group -> work_set
  const getHierarchy = () => {
    return workSetGroups.map((workSetGroup: FloorMapWorkSetType) => ({
      placement_type_id: workSetGroup.placement_type_id,
      placement_type_name: workSetGroup.placement_type_name,
      work_set_check_groups: workSetGroup.work_set_check_groups
    }));
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        handleClose={handleClose}
        title={label || "Выберите конструктив"}
      />
      
      <View>
        {getHierarchy().length > 0 ? (
          getHierarchy().map(renderPlacementType)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Конструктивы не найдены</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: "100%", 
    padding: 16, 
    paddingBottom: 50 
  },
  placementTypeContainer: {
    marginBottom: 0,
    backgroundColor: "#fff",
  },
  placementTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  placementTypeTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    marginLeft: 8,
  },
  placementTypeContent: {
    paddingLeft: 16,
  },
  group: {
    marginBottom: 0,
    backgroundColor: "#fff",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    marginLeft: 8,
  },
  groupContent: {
    paddingLeft: 16,
  },
  workSetItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workSetContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  workSetInfo: {
    flex: 1,
  },
  workSetName: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    marginLeft: 8,
  },
  workSetDetails: {
    fontSize: 12,
    color: "#666",
  },
  radioContainer: {
    marginLeft: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
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
