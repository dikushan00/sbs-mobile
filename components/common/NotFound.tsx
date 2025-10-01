import { COLORS } from "@/constants";
import { StyleSheet, View, Text } from "react-native";

type PropsType = {
  title?: string
}
export const NotFound = ({title}: PropsType) => {
  return <View style={styles.wrapper}>
    <Text style={styles.text}>{title || 'Не найдено'}</Text>
  </View>
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15
  },
  text: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 18
  },
});