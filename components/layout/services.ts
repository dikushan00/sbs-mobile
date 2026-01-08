import ForgetPasswordPage from "@/app/forget-password";
import LoginPage from "@/app/login";
import NotificationsPage from "@/app/notifications";
import NotificationDetailsPage from "@/app/notification-details";
import ProfilePage from "@/app/profile";
import OkkPage from "@/app/okk";
import { PAGE_NAMES } from "@/constants";
import { sortArrayToFirstPlace } from "@/services";
import MainPage from "@/app/index";
import RegisterPage from "@/app/register";

export const authRoutes = [
  {
    name: PAGE_NAMES.notifications,
    component: NotificationsPage,
    options: { title: "Уведомления" },
  },
  {
    name: PAGE_NAMES.notificationDetails,
    component: NotificationDetailsPage,
    options: { title: "Уведомления" },
  },
  {
    name: PAGE_NAMES.profile,
    component: ProfilePage,
    options: { title: "Профиль" },
  },
  {
    name: PAGE_NAMES.okk,
    component: OkkPage,
    options: { title: "Контроллер", withDesc: true, dynamicTitle: true },
  },
  {
    name: PAGE_NAMES.okkTasks,
    component: OkkPage,
    options: { title: "Контроллер", dynamicTitle: true, withDesc: true },
  },
  {
    name: PAGE_NAMES.main,
    component: MainPage,
    options: { title: "Проекты", withDesc: true, dynamicTitle: true },
  },
];

export const getAuthRoutes = () => {
  try {
    return sortArrayToFirstPlace(
      [...authRoutes],
      "name",
      PAGE_NAMES.main
    );
  } catch (e) {
  }
};

export const unAuthRoutes = [
  {
    name: PAGE_NAMES.login,
    component: LoginPage,
    options: { title: "", withoutLayout: true },
  },
  {
    name: PAGE_NAMES.forgetPassword,
    component: ForgetPasswordPage,
    options: { title: "", withoutLayout: true },
  },
  {
    name: PAGE_NAMES.register,
    component: RegisterPage,
    options: { title: "", withoutLayout: true },
  },
];

export const unAuthenticatedRoutes = sortArrayToFirstPlace(
  unAuthRoutes,
  "name",
  PAGE_NAMES.login
);
