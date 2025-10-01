import { CustomButton } from "@/components/common/CustomButton";
import {
  appState,
  setBottomDrawerLoading,
} from "@/services/redux/reducers/app";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { SelectMasterDrawerType } from "../types";
import { NotFound } from "@/components/common/NotFound";

type PropsType = { data: SelectMasterDrawerType; handleClose: () => void };

export const SelectMaster = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch();
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const {
    bottomDrawerData: { loading },
  } = useSelector(appState);

  const handlePress = async () => {
    if (loading || !selectedMasterId) return;
    if (!data.onSubmit) return;
    dispatch(setBottomDrawerLoading(true));
    await data.onSubmit(selectedMasterId);
    dispatch(setBottomDrawerLoading(false));
  };

  const handleChange = (masterId: number) => setSelectedMasterId(masterId);

  return (
    <View style={styles.container}>
      <BottomDrawerHeader
        handleClose={handleClose}
        title={"Выберите мастера"}
      />
      <View>
        {data?.masters?.length ? (
          data?.masters?.map((item, i) => {
            return (
              <Pressable
                style={{
                  ...styles.item,
                  borderBottomWidth:
                    (data.masters?.length || 0) - 1 === i ? 1 : 0,
                  borderTopWidth: i === 0 ? 0 : 1,
                  backgroundColor:
                    selectedMasterId === item.team_master_id ? "#ddd" : "#fff",
                }}
                key={String(item.team_master_id)}
                onPress={() => handleChange(item.team_master_id)}
              >
                <Text>{item.team_master_fio || ""}</Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.notFound}>
            <NotFound title="Мастеров не найдено" />
          </View>
        )}
      </View>
      <CustomButton
        type="contained"
        disabled={loading || !selectedMasterId}
        onClick={handlePress}
        title={"Передать ключи"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 15, width: "100%", padding: 16 },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    alignItems: "center",
    flexDirection: "row",
  },
  notFound: {
    paddingVertical: 20,
  },
});
