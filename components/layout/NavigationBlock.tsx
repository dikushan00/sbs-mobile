import { MenuSidebar } from "@/components/layout/MenuSidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getAuthRoutes,
  unAuthenticatedRoutes,
} from "@/components/layout/services";
import { COLORS, PAGE_NAMES } from "@/constants";
import { userAppState } from "@/services/redux/reducers/userApp";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const Drawer = createDrawerNavigator();
export const NavigationBlock = () => {
  const { auth, isOkk, isProjectOkk } = useSelector(userAppState);

  const routes = useMemo(
    () => (auth ? getAuthRoutes(isOkk, isProjectOkk) : unAuthenticatedRoutes),
    [auth, isOkk, isProjectOkk]
  );

  return (
    <Drawer.Navigator
      backBehavior="history"
      drawerContent={(props) => <MenuSidebar {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        sceneStyle: {
          backgroundColor: COLORS.background,
        },
        header: (props) => (
          <PageHeader navigation={navigation} params={props.route.params} />
        ),
      })}
      initialRouteName={
        auth
          ? isProjectOkk
            ? PAGE_NAMES.main
            : PAGE_NAMES.remontList
          : PAGE_NAMES.login
      }
    >
      {routes.map((item) => {
        const Component = item.component;
        return (
          <Drawer.Screen
            key={item.name}
            name={item.name}
            options={{ title: item.options?.title || "" }}
            component={Component}
            initialParams={{ ...item.options }}
          />
        );
      })}
    </Drawer.Navigator>
  );
};
