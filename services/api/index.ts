import { doLogin } from "@/components/login/services";
import { apiUrl, STORE_KEYS } from "@/constants";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import Toast from "react-native-toast-message";
import { getUserCredentials } from "..";
import { storageService } from "../storage";

export let source: any;

let isRefreshing = false;
let failedQueue: any[] = [];

export const instance = (
  authorization = true,
  options: any = {},
  url: string | null = null
) => {
  const reqOptions = {
    throwError: true,
    showSnackbar: true,
    ...options,
  };
  const { throwError, showSnackbar } = reqOptions;

  source = axios?.CancelToken?.source();
  const axiosInstance = axios.create({
    baseURL: url || apiUrl,
    cancelToken: options.cancelToken || source.token,
  });

  if (authorization) {
    axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(STORE_KEYS.accessToken);
        // console.log(token)
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // console.log("_error", error.response, error);
      const originalRequest = error.config;
      if (
        showSnackbar &&
        error.response?.status !== 401 &&
        error?.code !== "ERR_NETWORK" &&
        !axios.isCancel(error)
      ) {
        const message = error?.response?.data?.error;
        const defaultMessage = error.response?.status
          ? `${error.response?.status}, ${error?.response?.statusText}`
          : "Ошибка";
        Toast.show({
          type: "error",
          text1: message || defaultMessage,
          position: "top",
          visibilityTime: 8000,
          autoHide: true,
          topOffset: 50,
        });
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          let newAccessToken: string | undefined = "";
          const data = await getUserCredentials();
          if (!data) return { data: { status: false, errorCode: 401 } };
          const res = await doLogin(data, undefined);
          if (res?.status) {
            //@ts-ignore
            newAccessToken = res?.token?.access;

            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;

            if (newAccessToken) processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
            //@ts-ignore
          } else if (!res?.errNetwork) {
            await storageService.resetAllData();
            console.log('delete')
            await SecureStore.deleteItemAsync(STORE_KEYS.auth);
            await Updates.reloadAsync();
          }
        } catch (err) {
          processQueue(err, null);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return throwError
        ? Promise.reject(error)
        : Promise.reject(
            error?.response?.data?.error || "Что-то пошло не так!"
          );
    }
  );
  return axiosInstance;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};
