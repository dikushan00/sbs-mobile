import { CustomLoader } from "@/components/common/CustomLoader";
import { CustomTabs } from "@/components/common/CustomTabs";
import { NotFound } from "@/components/common/NotFound";
import { COLORS } from "@/constants";
import {
  getRemontsData,
  userAppState,
} from "@/services/redux/reducers/userApp";
import { sortByLength } from "@/utils";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RemontItem } from "../remonts/RemontItem";
import { okkStatuses, okkStatusesData } from "./services";

export const OkkRemonts = () => {
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(okkStatuses.PROCESSING);
  const { remonts, isRemontsFetching: isFetching } = useSelector(userAppState);

  const getData = async (
    isRefreshing = false,
    controller?: AbortController
  ) => {
    dispatch(
      getRemontsData(
        setIsRefreshing,
        { signal: controller?.signal },
        isRefreshing,
        true
      ) as never
    );
  };

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      getData(false, controller);
      return () => controller.abort();
    }, [])
  );

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const tabsData = useMemo(() => {
    const tabs = Object.keys(okkStatusesData).map((key) => {
      const length = remonts?.filter((item) => item.okk_status === key)?.length;
      return {
        value: key,
        label: `${okkStatusesData[key].name} (${length || 0})`,
        length,
      };
    });
    return sortByLength(tabs);
  }, [remonts]);

  const remontsFiltered = useMemo(() => {
    return remonts?.filter((item) => item.okk_status === activeTab);
  }, [remonts, activeTab]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => getData(true)}
        />
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      style={styles.container}
    >
      {isFetching && <CustomLoader />}
      <View style={styles.tabsWrapper}>
        <CustomTabs
          data={tabsData}
          defaultActive={activeTab}
          onChange={onTabChange}
        />
      </View>
      {remontsFiltered?.length ? (
        <View style={{ gap: 10, marginTop: 5 }}>
          {remontsFiltered.map((item) => (
            <RemontItem key={item.remont_id} data={item} />
          ))}
        </View>
      ) : (
        !isFetching && <NotFound />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
  },
  tabsWrapper: {
    marginVertical: 10,
  },
});
