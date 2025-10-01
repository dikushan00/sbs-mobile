import { PAGE_NAMES, STORE_KEYS } from "@/constants";
import { getUserCredentials } from "@/services";
import {
  resetAuthData,
  setAuth,
  setIsProjectOkk,
  setLoginData,
} from "@/services/redux/reducers/userApp";
import { AuthLoginData } from "@/services/types";
import { useNavigation } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { CustomLoader } from "../common/CustomLoader";
import { useSnackbar } from "../snackbar/SnackbarContext";
import styles from "./login.style";
import { handleLoginResData, loginFormReq } from "./services";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/services";

export const LoginForm = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [biometricData, setBiometricData] = useState<AuthLoginData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isBiometricSupportedAndAllowed, setIsBiometricSupportedAndAllowed] =
    useState(false);
  const { showErrorSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      let isAllowedBiometry: string | null = "false";
      let compatible = false;
      try {
        compatible =
          (await LocalAuthentication.hasHardwareAsync()) &&
          (await LocalAuthentication.isEnrolledAsync());
        isAllowedBiometry = await SecureStore.getItemAsync(
          STORE_KEYS.allowBiometry
        );
      } catch (e) { }
      const isBiometryEnabled = compatible && isAllowedBiometry === "true";

      const biometryData = await getUsernameAndPassword();
      setIsBiometricSupportedAndAllowed(isBiometryEnabled);
      if (!!biometryData && isBiometryEnabled)
        authenticateWithBiometrics(true, biometryData);
    })();
  }, []);

  const onChange = (name: string, text: string) => {
    setFormData((prev) => ({ ...prev, [name]: text }));
  };

  const getUsernameAndPassword = async () => {
    const data = await getUserCredentials();
    if (!data) return;
    setBiometricData(data);
    return data;
  };

  const isUserAllowBiometry = async (data: AuthLoginData) => {
    let compatible = true;
    try {
      compatible =
        (await LocalAuthentication.hasHardwareAsync()) &&
        (await LocalAuthentication.isEnrolledAsync());
    } catch (e) { }
    if (!compatible) return saveAuthData(data);
    await Alert.alert(
      "Авторизация",
      "Использовать биометрию(FaceID, TouchID) для последующего входа?",
      [
        {
          text: "НЕТ",
          onPress: resetAuthData,
        },
        {
          text: "ДА",
          onPress: () => saveAuthData(data),
        },
      ],
      { cancelable: true, onDismiss: resetAuthData }
    );
  };

  const authenticateWithBiometrics = async (
    allow: boolean = false,
    data: AuthLoginData | null = null
  ) => {
    if (disabled) return;
    if (!isBiometricSupportedAndAllowed && allow !== true) return;
    try {
      const { success } = await LocalAuthentication.authenticateAsync({
        requireConfirmation: false,
        fallbackLabel: "Ввести пароль",
        promptMessage: "Авторизация",
      });
      if (success) {
        onSubmit(true, data);
      }
    } catch (error) { }
  };

  const saveAuthData = async (data: AuthLoginData) => {
    try {
      await SecureStore.setItemAsync(STORE_KEYS.allowBiometry, "true");
      await SecureStore.setItemAsync(STORE_KEYS.login, data.login);
      await SecureStore.setItemAsync(STORE_KEYS.password, data.password);
    } catch (e) { }
  };

  type BodyType = AuthLoginData & {
    mobile_token?: string | null;
    is_mobile?: boolean;
  };

  const handleLoginRes = async (res: { token: { access: string; refresh: string } }, isBiometric: boolean | undefined, body: BodyType) => {

    let newBiometricUser = false;
    if (!isBiometric) {
      const authData = await getUsernameAndPassword();
      if (authData?.login) {
        if (authData.login !== body?.login) {
          newBiometricUser = true;
          await isUserAllowBiometry(body);
        }
      }
    }
    let allowBiometry;
    try {
      allowBiometry = await SecureStore.getItemAsync(STORE_KEYS.allowBiometry);
    } catch (e) {
      await resetAuthData();
    }

    if (!newBiometricUser) {
      try {
        if (!allowBiometry && allowBiometry !== "false")
          await isUserAllowBiometry(body);
        else if (allowBiometry === "true" && !isBiometric) saveAuthData(body);
      } catch (e) {
        await resetAuthData();
      }
    }
    dispatch(setAuth(true));
    dispatch(setLoginData(res));
  }

  const onSubmit = async (
    isBiometric?: boolean,
    data?: AuthLoginData | null | undefined
  ) => {
    if (disabled) return;
    let body: BodyType | null =
      isBiometric === true ? data || biometricData : formData;
    if (!body) body = { login: "", password: "" };
    const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    body.mobile_token = pushToken;
    body.is_mobile = true;

    if (!isBiometric) {
      if (!body?.login || !body.password)
        return showErrorSnackbar("Заполните обязательные поля!");
    }
    setLoading(true);
    const res = await loginFormReq(body);
    setLoading(false);
    if (!res) return isBiometric && (await resetAuthData());
    if (res?.length === 1) {
      const loginRes = res[0].res
      if (loginRes) {
        dispatch(setIsProjectOkk(res[0].type === 'okk'))
        handleLoginRes(loginRes, isBiometric, body)
        await handleLoginResData(loginRes, res[0].type === 'okk', dispatch)
      }
      return
    }

    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.selectModule,
        data: {
          modules: res, onSubmit: async (res: any, type: string) => {
            if (res) {
              dispatch(setIsProjectOkk(type === 'okk'))
              //@ts-ignore
              handleLoginRes(res, isBiometric, body)
              await handleLoginResData(res, type === 'okk', dispatch)
            }
          }
        },
      })
    )
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View>
          <CustomLoader />
        </View>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#BABABA"
          value={formData.login}
          autoCapitalize="none"
          onChangeText={(text) => onChange("login", text)}
          placeholder={"Email"}
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry
          placeholderTextColor="#BABABA"
          style={styles.input}
          autoCapitalize="none"
          value={formData.password}
          onChangeText={(text) => onChange("password", text)}
          placeholder={"Пароль"}
        />
      </View>
      <TouchableOpacity
        disabled={loading}
        style={styles.button}
        onPress={() => onSubmit()}
      >
        <Text style={styles.buttonText}>Войти</Text>
      </TouchableOpacity>
      {biometricData && isBiometricSupportedAndAllowed && (
        <TouchableOpacity
          style={styles.buttonMargin}
          disabled={!biometricData}
          onPress={() => authenticateWithBiometrics()}
        >
          <Text style={styles.buttonText}>
            {loading ? "Загрузка" : "Войти через отпечаток"}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.textButton}
        disabled={disabled}
        onPress={() => navigation.navigate(PAGE_NAMES.register as never)}
      >
        <Text style={styles.buttonTextPrimary}>Регистрация</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.textButton}
        disabled={disabled}
        onPress={() => navigation.navigate(PAGE_NAMES.forgetPassword as never)}
      >
        <Text style={styles.buttonTextPrimary}>Забыли пароль?</Text>
      </TouchableOpacity>
    </View>
  );
};
