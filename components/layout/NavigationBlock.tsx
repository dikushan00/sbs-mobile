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
  const { auth, isOkk, userData } = useSelector(userAppState);

  const routes = useMemo(
    () => (auth ? getAuthRoutes() : unAuthenticatedRoutes),
    [auth]
  );

  if(!userData && auth) return null;

  return (
    <Drawer.Navigator
      backBehavior="history"
      drawerContent={(props) => <MenuSidebar {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        swipeEnabled: false,
        sceneStyle: {
          backgroundColor: COLORS.backgroundWhite,
        },
        header: (props) => (
          <PageHeader navigation={navigation} params={props.route.params} />
        ),
      })}
      initialRouteName={auth ? isOkk ? PAGE_NAMES.okk : PAGE_NAMES.home : PAGE_NAMES.login}
    >
      {routes?.map((item) => {
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