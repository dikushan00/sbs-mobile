import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT, PAGE_NAMES, SIZES } from "@/constants";
import { Icon, IconKeysType } from "@/components/Icon";
import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { NavigationLayout } from "@/components/layout/NavigationLayout";
import { OuraFab } from "@/components/main/OuraFab";
import { setPageSettings, showCustomWebViewMode } from "@/services/redux/reducers/app";

type SectionItem = {
  id: string;
  icon: IconKeysType;
  label: string;
  navigateTo?: string;
  tab?: string;
};

const sections: SectionItem[] = [
  { id: "stages", icon: "listFilled", label: "Этапы", navigateTo: PAGE_NAMES.main, tab: "stages" },
  { id: "payments", icon: "payment", label: "Платежи", navigateTo: PAGE_NAMES.main, tab: "payments" },
  { id: "materials", icon: "carFilled", label: "Материалы", navigateTo: PAGE_NAMES.main, tab: "materials" },
  { id: "projects", icon: "folder", label: "Мои проекты", navigateTo: PAGE_NAMES.main },
  { id: "agreement", icon: "documentPenAlt", label: "Договоры", navigateTo: PAGE_NAMES.contracts },
  { id: "documents", icon: "document", label: "Документы", navigateTo: PAGE_NAMES.main, tab: "documents" },
];

export const HomePage = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(
      setPageHeaderData({
        title: "Главная",
        desc: "",
      })
    );
    dispatch(setPageSettings({ backBtn: false, goBack: null }));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Здесь можно добавить логику обновления данных
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSectionPress = (item: SectionItem) => {
    if (item.navigateTo) {
      // @ts-ignore
      navigation.navigate(item.navigateTo as never, item.tab ? { tab: item.tab, mainMode: true } : undefined);
    }
  };

//   const handleFAQPress = (item: FAQItem) => {                                                                                                                                                                                  
//     // TODO: реализовать переход к детальному ответу FAQ
//     console.log("FAQ pressed:", item.question);
//   };

  const renderSectionItem = (item: SectionItem) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        styles.sectionItem,
        pressed && styles.sectionItemPressed,
      ]}
      onPress={() => handleSectionPress(item)}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.iconContainer, pressed && styles.iconContainerPressed]}>
            <Icon name={item.icon} width={22} height={22} fill={pressed ? COLORS.primary : COLORS.primarySecondary} />
          </View>
          <Text style={[styles.sectionLabel, pressed && styles.sectionLabelPressed]}>{item.label}</Text>
        </>
      )}
    </Pressable>
  );

//   const renderFAQItem = (item: FAQItem, index: number) => (
//     <View key={item.id}>
//       <TouchableOpacity
//         style={styles.faqItem}
//         onPress={() => handleFAQPress(item)}
//         activeOpacity={0.7}
//       >
//         <Text style={styles.faqQuestion}>{item.question}</Text>
//         <Icon name="arrowRightAlt" width={6} height={10} fill="#757575" />
//       </TouchableOpacity>
//       {index < faqItems.length - 1 && <View style={styles.faqDivider} />}
//     </View>
//   );

  return (
    <NavigationLayout>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Main Sections Grid */}
        <View style={styles.sectionsCard}>
          <View style={styles.sectionsGrid}>
            {sections.map(renderSectionItem)}
          </View>
        </View>

        {/* FAQ Section */}
        {/* <View style={styles.faqCard}>
          <Text style={styles.faqTitle}>Часто задаваемые вопросы</Text>
          <View style={styles.faqList}>
            {faqItems.map((item, index) => renderFAQItem(item, index))}
          </View>
        </View> */}
        <OuraFab bottom={20} onPress={() => dispatch(showCustomWebViewMode({ url: "https://oura.bi.group/" }))}/>
      </ScrollView>
    </NavigationLayout>
  );
};

// type FAQItem = {
//   id: string;
//   question: string;
// };
// const faqItems: FAQItem[] = [
//   { id: "1", question: "Как можно оформить заказ на необходимый строительный материал?" },
//   { id: "2", question: "Каким образом вызвать специалиста отдела контроля качества (ОКК)?" },
//   { id: "3", question: "Как связаться с отделом документооборота?" },
//   { id: "4", question: "Куда обратиться по вопросам оплаты?" },
// ];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundNew,
  },
  contentContainer: {
    gap: 16,
    flex: 1
  },
  sectionsCard: {
    backgroundColor: "#FFF",
    padding: 16,
    paddingTop: 5,
    borderEndEndRadius: 16,
    borderStartEndRadius: 16,
    alignItems: "center",
  },
  sectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: 10,
    paddingBottom: 5,
  },
  sectionItem: {
    alignItems: "center",
    width: "33%",
    gap: 12,
    padding: 8,
    borderRadius: 12,
  },
  sectionItemPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerPressed: {
    opacity: 0.8,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: "#1F1F1F",
    textAlign: "center",
  },
  sectionLabelPressed: {
    color: COLORS.primary,
  },
  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  faqTitle: {
    fontSize: 14,
    fontFamily: FONT.medium,
    fontWeight: "600",
    color: "#1F1F1F",
  },
  faqList: {
    gap: 0,
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: "#1F1F1F",
    lineHeight: 16,
  },
  faqDivider: {
    height: 0.5,
    backgroundColor: "#E0E0E0",
  },
});

