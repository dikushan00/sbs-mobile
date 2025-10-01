import { COLORS } from "@/constants";
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { RadioButton } from "react-native-paper"
import { AnimatedStyle } from "react-native-reanimated";
import { SelectModuleProps } from "../types";
import { CustomButton } from "@/components/common/CustomButton";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { useDispatch, useSelector } from "react-redux";
import { closeBottomDrawer } from "@/services/redux/reducers/app";
import { userAppState } from "@/services/redux/reducers/userApp";

type PropsType = { data: SelectModuleProps; handleClose: () => void };
export const SelectModule = ({ data, handleClose }: PropsType) => {
  const dispatch = useDispatch()
  const { isProjectOkk } = useSelector(userAppState)
  const [selectedModule, setSelectedModule] = useState<{ type: string, res: AnimatedStyle } | null>(null)

  const { modules, onSubmit, btnLabel } = data

  useEffect(() => {
    if(modules?.length) {
      let selected = modules[0]
      if(isProjectOkk) {
        const projectOkk = modules.find(item => item.type === 'okk')
        if(projectOkk) {
          selected = projectOkk
        }
      }
      setSelectedModule(selected)
    }
  }, [modules, isProjectOkk])

  const onChange = (module: any) => {
    setSelectedModule(module)
  }

  const handleSubmit = () => {
    onSubmit && onSubmit(selectedModule?.res, selectedModule?.type as 'okk')
    dispatch(closeBottomDrawer())
  }

  return <View style={styles.container}>
    <BottomDrawerHeader
      handleClose={handleClose}
      title={"Выберите модуль"}
    />
    <View style={{ gap: 15, paddingBottom: 20, width: '100%' }}>
      {modules?.map(module => {
        return <Pressable
          key={module?.type}
          onPress={() =>
            onChange(module)
          } style={{ width: '100%' }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              borderRadius: 8,
              borderColor: module.type === selectedModule?.type ? COLORS.primary : '#ccc',
              borderWidth: 2,
              width: '100%'
            }}
          >
            <RadioButton
              value={module.type}
              color={COLORS.primary}
              uncheckedColor={COLORS.primary}
              status={
                selectedModule?.type === module?.type
                  ? "checked"
                  : "unchecked"
              }
              onPress={() =>
                onChange(module)
              }
            />
            <Text style={{color: module.type === selectedModule?.type ? COLORS.primary : '#000'}}>{modulesLabels[module.type as 'master'] || ''}</Text>
          </View>
        </Pressable>
      })}
      <CustomButton
        type="contained"
        color={COLORS.primary}
        onClick={handleSubmit}
        disabled={!selectedModule}
        title={btnLabel || "Войти"}
      />
    </View>
  </View>
}

const modulesLabels = {
  'master': 'Для мастеров',
  'okk': 'ОКК черновые'
}

const styles = StyleSheet.create({
  container: { gap: 15, width: "100%", padding: 16 },
});