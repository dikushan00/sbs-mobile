import { COLORS, FONT } from "@/constants";
import { getPrimaryColor } from "@/services";
import { AppDispatch } from "@/services/redux";
import { appState } from "@/services/redux/reducers/app";
import { logout, userAppState } from "@/services/redux/reducers/userApp";
import { MenuItem } from "@/services/redux/types";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Badge } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export const MenuSidebar = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { menu, userData, logoutLoading } = useSelector(userAppState);
  const { newVersionBannerShowed } = useSelector(appState);

  const handleMenuClick = (menuItem: MenuItem) => {
    if (!menuItem?.menu_action || menuItem?.sub_menus?.length) return;
    if (menuItem.what)
      return navigation.navigate(menuItem.menu_action, {
        status: menuItem.what,
      } as never);
    navigation.navigate(menuItem.menu_action);
  };
  const handleLogout = () => {
    if (logoutLoading) return;
    navigation.closeDrawer();
    dispatch(logout());
  };

  return (
    <View
      style={{
        paddingTop:
          Platform.OS === "ios"
            ? newVersionBannerShowed
              ? 0
              : insets.top
            : insets.top + 10,
        flex: 1,
        backgroundColor: "#f5f5f5",
      }}
    >
      <View style={styles.drawerHeaderWrapper}>
        <TouchableOpacity
          style={styles.drawerHeader}
          onPress={() => navigation.closeDrawer()}
        >
          <Text style={styles.headerText}>☰</Text>
          <Text style={styles.drawerTitle}>Smart Build System</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userInfoLeft}>
          <View style={styles.userInfoHeader}>
            <AntDesign name="user" color={getPrimaryColor()} size={25} />
            <Text style={styles.userInfoText}>
              {userData?.fio || "Нет данных"}
            </Text>
          </View>
          {!!userData?.email && <Text>{userData.email}</Text>}
        </View>
        <TouchableOpacity
          style={styles.logout}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          <SimpleLineIcons
            name="login"
            size={24}
            color={logoutLoading ? "#ccc" : "black"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.drawerContent}>
        {menu?.map((item) => {
          return (
            <MenuItemBlock
              key={String(item.menu_id)}
              onClick={handleMenuClick}
              data={item}
            />
          );
        })}
      </View>
    </View>
  );
};

const MenuItemBlock = ({
  data,
  onClick,
  paddingLeft = 15,
  deep = 0,
}: {
  data: MenuItem;
  onClick: (data: MenuItem) => void;
  paddingLeft?: number;
  deep?: number;
}) => {
  return (
    <>
      <TouchableOpacity
        style={{
          ...styles.drawerItem,
          paddingLeft,
          paddingVertical: deep > 0 ? 4 : 7,
        }}
        onPress={() => onClick && onClick(data)}
        disabled={!!data?.sub_menus?.length}
      >
        <Text style={styles.drawerItemText}>{data.menu_name}</Text>
        {!!data?.count && (
          <Badge style={{ backgroundColor: COLORS.primary }}>
            {data.count}
          </Badge>
        )}
        {data.menu_action === "web" && (
          <Text style={styles.drawerItemTextWeb}>WEB</Text>
        )}
      </TouchableOpacity>
      {!!data?.sub_menus?.length &&
        data.sub_menus?.map((item) => (
          <MenuItemBlock
            key={item.menu_id}
            deep={deep + 1}
            paddingLeft={15 + (deep + 1) * 15}
            data={item}
            onClick={onClick}
          />
        ))}
    </>
  );
};

const styles = StyleSheet.create({
  drawerHeaderWrapper: {
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#dedede",
    paddingBottom: 11,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  drawerContent: {
    marginTop: 20,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  drawerItem: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drawerItemText: {
    fontSize: 16,
    fontFamily: FONT.medium,
  },
  drawerItemTextWeb: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  headerText: {
    fontSize: Platform.OS === "ios" ? 30 : 24,
    fontWeight: "bold",
    marginRight: 12,
  },
  userInfo: {
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    width: "100%",
    marginTop: 10,
  },
  userInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: 220,
    flexWrap: "nowrap",
  },
  userInfoLeft: {
    flexDirection: "column",
    gap: 5,
    marginBottom: 10,
  },
  userInfoText: {
    fontFamily: FONT.regular,
    fontSize: 16,
  },
  logout: {
    padding: 5,
  },
});
