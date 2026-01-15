import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT, PAGE_NAMES, SIZES } from "@/constants";
import { setPageSettings, setHideFooterNav } from "@/services/redux/reducers/app";
import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { CustomLoader } from "@/components/common/CustomLoader";
import { Icon } from "@/components/Icon";
import { NotFound } from "@/components/common/NotFound";
import { getAgreements } from "./services";
import { Agreement } from "./services/types";

export const ContractsPage = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [agreements, setAgreements] = useState<Agreement[]>([]);

  useEffect(() => {
    dispatch(setPageHeaderData({ title: "Договоры", desc: "" }));
    dispatch(setHideFooterNav(false));
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: () => {
        // @ts-ignore
        navigation.navigate(PAGE_NAMES.home as never);
      }
    }));
  }, []);

  const fetchData = async () => {
    const res = await getAgreements();
    setAgreements(res || []);
  };

  useEffect(() => {
    setIsFetching(true);
    fetchData().finally(() => setIsFetching(false));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const getSignStatus = (agreement: Agreement) => {
    if (agreement.project_head_is_sign && agreement.contractor_is_sign) {
      return { text: "Подписан", color: "#4CAF50", bgColor: "#E8F5E9" };
    }
    if (agreement.project_head_is_sign || agreement.contractor_is_sign) {
      return { text: "На подписании", color: "#979935", bgColor: "#F5EECA" };
    }
    return { text: "Ожидает подписи", color: "#757575", bgColor: "#F5F5F5" };
  };

  const renderAgreementCard = (agreement: Agreement) => {
    const status = getSignStatus(agreement);
    
    return (
      <View key={agreement.project_agreement_id} style={styles.card}>
        {/* Заголовок - номер договора */}
        <View style={styles.cardHeader}>
          <Text style={styles.docName} numberOfLines={2}>{agreement.doc_name}</Text>
        </View>
        <View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
        {/* Стороны договора */}
        <View style={styles.blocksRow}>
            <Text>Подъезды:</Text>
            {/* {project?.blocks && (
              <View style={styles.blocksList}>
                {project.blocks.split(' / ').map((block, index) => {
                  const entranceNumber = block.trim().split(' ')[0];
                  const blockName = block.trim().split(' ')[1];
                  return (<View key={index} style={styles.blockBadge}>
                    <Text style={styles.blockIndex}>{entranceNumber}</Text>
                    <Text style={styles.blockText}>{blockName}</Text>
                  </View>)
                })}
              </View>
            )} */}
          </View>
          <View style={styles.dateRow}>
            <Text>Период:</Text>
            {/* <View style={styles.dateBadge}>
              <Text style={styles.detailTextValue}>{project.start_date}</Text>
              <Text style={styles.detailTextValue}>-</Text>
              <Text style={styles.detailTextValue}>{project.finish_date}</Text>
            </View> */}
          </View>
        {/* Статус отправки в 1С */}
        {agreement.is_sent_to_1c === 1 && (
          <View style={styles.sentTo1CRow}>
            <Icon name="checkCircle" width={12} height={12} fill="#4CAF50" />
            <Text style={styles.sentTo1CText}>Отправлен в 1С</Text>
          </View>
        )}

        <Text style={styles.linkText}>Подробнее</Text>
      </View>
    );
  };

  const renderContent = () => {
    return agreements.length > 0 
      ? agreements.map(renderAgreementCard)
      : !isFetching && <NotFound title="Нет договоров" />;
  };

  return (
    <View style={styles.wrapper}>
      {isFetching && <CustomLoader />}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.backgroundNew,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    minHeight: 55
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  // Agreement card styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  docName: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: "#242424",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONT.medium,
  },
  sumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 8,
  },
  sumValue: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: "#242424",
  },
  partiesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  partyBlock: {
    flex: 1,
  },
  partyDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  partyLabel: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  partyName: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: "#242424",
    marginBottom: 2,
  },
  partyFio: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 8,
  },
  signRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  signDateText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: "#4CAF50",
  },
  pendingText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: "#FF9800",
  },
  sentTo1CRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  sentTo1CText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: "#4CAF50",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  errorText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: "#F44336",
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 7
  },
  blocksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  blocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10
  },
  blocksList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  blockBadge: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  blockText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  blockIndex: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#242424',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 5,
    paddingVertical: 0,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailTextValue: {
    fontSize: SIZES.regular,
    color: COLORS.black,
  },
  linkText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.primarySecondary,
    marginTop: 7,
  }
});
