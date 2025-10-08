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
  const { auth, isOkk } = useSelector(userAppState);

  const routes = useMemo(
    () => (auth ? getAuthRoutes(isOkk) : unAuthenticatedRoutes),
    [auth, isOkk]
  );

  return (
    <Drawer.Navigator
      backBehavior="history"
      drawerContent={(props) => <MenuSidebar {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        sceneStyle: {
          backgroundColor: COLORS.backgroundWhite,
        },
        header: (props) => (
          <PageHeader navigation={navigation} params={props.route.params} />
        ),
      })}
      initialRouteName={auth ? PAGE_NAMES.main : PAGE_NAMES.login}
    >
      {routes.map((item) => {
        const Component = item.component;
        if (!Component) return null;
        return (
          <Drawer.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.options?.title || "",
              headerShown: !item.options?.withoutLayout,
            }}
            component={Component}
            initialParams={{ ...item.options }}
          />
        );
      })}
    </Drawer.Navigator>
  );
};