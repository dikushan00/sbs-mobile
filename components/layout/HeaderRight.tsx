import { PAGE_NAMES } from "@/constants";
import { userAppState } from "@/services/redux/reducers/userApp";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

export const HeaderRight = () => {
  const navigation = useNavigation();
  const route: { params?: { withoutLayout?: boolean } } = useRoute();
  const { logoutLoading } = useSelector(userAppState);

  const handleClick = () => {
    navigation.navigate(PAGE_NAMES.notifications as never);
  };

  if (route?.params?.withoutLayout) return <View></View>;
  return (
    <TouchableOpacity
      style={styles.headerRight}
      onPress={handleClick}
      disabled={logoutLoading}
    >
      <FontAwesome5 name="bell" size={22} color={"#404040"} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    padding: 5,
  },
});
