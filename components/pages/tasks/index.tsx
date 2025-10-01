import { CustomLoader } from "@/components/common/CustomLoader";
import { CustomTabs } from "@/components/common/CustomTabs";
import { NotFound } from "@/components/common/NotFound";
import { WorkSetBlock } from "@/components/features/WorkSetBlock";
import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { workStatusData, WorkStatusesKeyType } from "../remonts/services";
import { WorkType } from "../remonts/types";

type PropsType = {
  status: WorkStatusesKeyType;
  isFetching: boolean;
  data: WorkType[];
  setData: (data: WorkType[]) => void;
  getData: (controller?: AbortController) => void;
};
export const Tasks = ({
  status,
  data,
  getData,
  isFetching,
  setData,
}: PropsType) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("ALL");

  useFocusEffect(
    useCallback(() => {
      setData([]);
      if (status) {
        dispatch(
          setPageHeaderData({
            desc: workStatusData[status].name,
            descColor:
              workStatusData[status].textColorDark ||
              workStatusData[status].textColor,
          })
        );
      }
      const controller = new AbortController();
      getData(controller);
      return () => controller.abort();
    }, [status])
  );

  const onWorkSubmit = (res: WorkType[]) => {
    setData(res || []);
  };

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 25 }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={() => getData()} />
      }
    >
      {isFetching && <CustomLoader />}
      <View style={styles.tabsWrapper}>
        <CustomTabs
          data={[
            {
              label: "Все",
              value: "ALL",
            },
          ]}
          defaultActive={activeTab}
          onChange={onTabChange}
        />
      </View>
      <View style={styles.works}>
        {data?.length
          ? data.map((workSet) => {
              return (
                <WorkSetBlock
                  key={String(workSet.work_set_id)}
                  data={workSet}
                  darkMode
                  showRemontInfo
                  onWorkSubmit={onWorkSubmit}
                />
              );
            })
          : !isFetching && <NotFound />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 10,
    height: "100%",
  },
  tabsWrapper: {
    marginTop: 15,
    display: "none",
  },
  works: {
    marginTop: 15,
    gap: 15,
  },
});
