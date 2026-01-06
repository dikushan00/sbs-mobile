import { PAGE_NAMES } from "@/constants";
import { appState } from "@/services/redux/reducers/app";
import { userAppState } from "@/services/redux/reducers/userApp";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

export const HeaderRight = () => {
  const navigation = useNavigation();
  const route: { params?: { withoutLayout?: boolean } } = useRoute();
  const { logoutLoading } = useSelector(userAppState);
  const { notificationsCount } = useSelector(appState);

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
      <FontAwesome5 name="bell" size={19} color={"#404040"} />
      {notificationsCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {notificationsCount > 99 ? "99+" : notificationsCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    padding: 5,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
