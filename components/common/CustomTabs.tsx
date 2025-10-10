import { COLORS, FONT } from "@/constants";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

type PropsType = {
  data: { label: string; value: string }[];
  defaultActive: string;
  onChange: (tab: string) => void;
  alt?: boolean;
};
export const CustomTabs = ({ data, defaultActive, onChange, alt = false }: PropsType) => {
  const [activeTab, setActiveTab] = useState(defaultActive || null);
  const handleChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
    onChange && onChange(newActiveTab);
  };
  return (
    <ScrollView
      horizontal
      style={[styles.container, alt && styles.containerAlt]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {data?.map((item, index) => {
        const isActive = activeTab === item.value;
        const isFirst = index === 0;
        const isLast = index === data.length - 1;
        
        return (
          <TouchableOpacity
            key={item.value.toString()}
            style={[
              alt ? styles.tabAlt : styles.tab,
              isActive && (alt ? styles.tabActiveAlt : styles.tabActive),
              !alt && isFirst && { marginLeft: 0 },
              !alt && isLast && { marginRight: 0 },
            ]}
            onPress={() => handleChange(item.value)}
          >
            <Text
              style={[
                alt ? styles.tabTextAlt : styles.tabText,
                isActive && (alt ? styles.tabTextActiveAlt : styles.tabTextActive),
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerAlt: {
    backgroundColor: "#EAEDF0",
    borderRadius: 8,
    padding: 3,
    maxHeight: 50
  },
  tab: {
    height: 48,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: "#000",
    fontFamily: FONT.medium,
  },
  tabTextActive: {
    color: "#fff",
  },
  // Alt styles for segmented control look
  tabAlt: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAEDF0",
  },
  tabActiveAlt: {
    backgroundColor: "#fff",
    zIndex: 1,
  },
  tabTextAlt: {
    fontSize: 16,
    color: "#000",
    fontFamily: FONT.regular,
  },
  tabTextActiveAlt: {
    color: "#000",
  },
});
