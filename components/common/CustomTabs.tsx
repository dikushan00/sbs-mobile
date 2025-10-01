import { COLORS, FONT } from "@/constants";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

type PropsType = {
  data: { label: string; value: string }[];
  defaultActive: string;
  onChange: (tab: string) => void;
};
export const CustomTabs = ({ data, defaultActive, onChange }: PropsType) => {
  const [activeTab, setActiveTab] = useState(defaultActive || null);
  const handleChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
    onChange && onChange(newActiveTab);
  };
  return (
    <ScrollView
      horizontal
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {data?.map((item, index) => {
        return (
          <TouchableOpacity
            key={item.value.toString()}
            style={[
              styles.tab,
              activeTab === item.value ? styles.tabActive : {},
              index === 0 && { marginLeft: 0 },
              index === data.length - 1 && { marginRight: 0 },
            ]}
            onPress={() => handleChange(item.value)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === item.value ? styles.tabTextActive : {},
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
});
