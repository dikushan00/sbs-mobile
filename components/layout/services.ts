import ForgetPasswordPage from "@/app/forget-password";
import LoginPage from "@/app/login";
import NotificationsPage from "@/app/notifications";
import OkkRemontsPage from "@/app/okk-remonts";
import OkkRemontsDetailPage from "@/app/okk-remonts/remontDetail";
import ProjectOkkPage from "@/app/project-okk";
import RegisterPage from "@/app/register";
import RemontsPage from "@/app/remonts/index";
import RemontsDetailPage from "@/app/remonts/remontDetail";
import TasksPage from "@/app/tasks";
import { PAGE_NAMES } from "@/constants";
import { sortArrayToFirstPlace } from "@/services";

export const authRoutes = [
  {
    name: PAGE_NAMES.main,
    component: RemontsPage,
    options: { title: "Ремонты" },
  },
  {
    name: PAGE_NAMES.notifications,
    component: NotificationsPage,
    options: { title: "Уведомления" },
  },
];

const okkAuthRoutes = [
  {
    name: PAGE_NAMES.main,
    component: OkkRemontsPage,
    options: { title: "Контроллер" },
  },
  {
    name: PAGE_NAMES.remontList,
    component: OkkRemontsPage,
    options: { title: "Контроллер" },
  },
  {
    name: PAGE_NAMES.remontDetail,
    component: OkkRemontsDetailPage,
    options: { title: "", dynamicTitle: true },
  },
];

const okkProjectAuthRoutes = [
  {
    name: PAGE_NAMES.main,
    component: ProjectOkkPage,
    options: { title: "Контроллер", withDesc: true, dynamicTitle: true },
  },
  {
    name: PAGE_NAMES.okkTasks,
    component: ProjectOkkPage,
    options: { title: "Контроллер", dynamicTitle: true, withDesc: true },
  },
];

const mastersAuthRoutes = [
  {
    name: PAGE_NAMES.remontList,
    component: RemontsPage,
    options: { title: "Ремонты" },
  },
  {
    name: PAGE_NAMES.remontDetail,
    component: RemontsDetailPage,
    options: { title: "", dynamicTitle: true },
  },
  {
    name: PAGE_NAMES.tasks,
    component: TasksPage,
    options: { title: "Задачи", withDesc: true, backBtn: false },
  },
];

export const getAuthRoutes = (isOkk: boolean, isProjectOkk: boolean) => {
  try {
    if (isProjectOkk) {
      const routes = authRoutes.filter(
        (route) => route.name !== PAGE_NAMES.main
      );
      return sortArrayToFirstPlace(
        [...routes, ...okkProjectAuthRoutes],
        "name",
        PAGE_NAMES.main
      );
    }
    if (isOkk) {
      const routes = authRoutes.filter(
        (route) => route.name !== PAGE_NAMES.main
      );
      return sortArrayToFirstPlace(
        [...routes, ...okkAuthRoutes],
        "name",
        PAGE_NAMES.main
      );
    }
    return sortArrayToFirstPlace(
      [...authRoutes, ...mastersAuthRoutes],
      "name",
      PAGE_NAMES.main
    );
  } catch (e) {
    return sortArrayToFirstPlace(
      [...authRoutes, ...mastersAuthRoutes],
      "name",
      PAGE_NAMES.main
    );
  }
};

export const unAuthRoutes = [
  {
    name: PAGE_NAMES.register,
    component: RegisterPage,
    options: { title: "Регистрация", withoutLayout: true },
  },
  {
    name: PAGE_NAMES.login,
    component: LoginPage,
    options: { title: "Авторизация", withoutLayout: true },
  },
  {
    name: PAGE_NAMES.forgetPassword,
    component: ForgetPasswordPage,
    options: { title: "Восставление пароля", withoutLayout: true },
  },
];

export const unAuthenticatedRoutes = sortArrayToFirstPlace(
  unAuthRoutes,
  "name",
  PAGE_NAMES.login
);
