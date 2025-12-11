import LogoBlue from "@/assets/images/logo_blue.svg";
import { COLORS, PAGE_NAMES, STORE_KEYS } from "@/constants";
import { getUserCredentials } from "@/services";
import { AppDispatch } from "@/services/redux";
import {
  resetAuthData,
  setAuth,
  setLoginData,
} from "@/services/redux/reducers/userApp";
import { AuthLoginData } from "@/services/types";
import { useNavigation } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { CustomLoader } from "../common/CustomLoader";
import { useSnackbar } from "../snackbar/SnackbarContext";
import styles from "./login.style";
import { doLogin } from "./services";

export const LoginForm = ({ disabled = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [biometricData, setBiometricData] = useState<AuthLoginData | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
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
      } catch (e) {}
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
    } catch (e) {}
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
    } catch (error) {}
  };

  const saveAuthData = async (data: AuthLoginData) => {
    try {
      await SecureStore.setItemAsync(STORE_KEYS.allowBiometry, "true");
      await SecureStore.setItemAsync(STORE_KEYS.login, data.login);
      await SecureStore.setItemAsync(STORE_KEYS.password, data.password);
    } catch (e) {}
  };

  type BodyType = AuthLoginData & {
    mobile_token?: string | null;
    is_mobile?: boolean;
  };

  const handleLoginRes = async (
    res: { token: { access: string; refresh: string } },
    isBiometric: boolean | undefined,
    body: BodyType
  ) => {
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
  };

  const onSubmit = async (
    isBiometric?: boolean,
    data?: AuthLoginData | null | undefined
  ) => {
    if (disabled) return;
    let body: BodyType | null =
      isBiometric === true ? data || biometricData : formData;
    if (!body) body = { login: "", password: "" };
    const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(pushToken)
    body.mobile_token = pushToken;
    body.is_mobile = true;

    if (!isBiometric) {
      if (!body?.login || !body.password)
        return showErrorSnackbar("Заполните обязательные поля!");
    }
    setLoading(true);
    const res = await doLogin(body, dispatch);
    setLoading(false);
    if (!res) return isBiometric && (await resetAuthData());

    if ("token" in res) {
      handleLoginRes(res, isBiometric, body);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View>
          <CustomLoader />
        </View>
      )}
      <View style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <LogoBlue width={200} height={40} />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#BABABA"
              value={formData.login}
              autoCapitalize="none"
              onChangeText={(text) => onChange("login", text)}
              placeholder={"Электронная почта"}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              secureTextEntry={!showPassword}
              placeholderTextColor="#BABABA"
              style={styles.inputWithIcon}
              autoCapitalize="none"
              value={formData.password}
              onChangeText={(text) => onChange("password", text)}
              placeholder={"Пароль"}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={24}
                color="#BABABA"
              />
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
              style={styles.textButton}
              disabled={disabled}
              onPress={() =>
                navigation.navigate(PAGE_NAMES.forgetPassword as never)
              }
            >
              <Text style={styles.buttonTextPrimaryLight}>Забыли пароль?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.textButton}
              disabled={disabled}
              onPress={() =>
                navigation.navigate(PAGE_NAMES.register as never)
              }
            >
              <Text style={styles.buttonTextPrimaryLight}>Регистрация</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            disabled={loading}
            style={styles.button}
            onPress={() => onSubmit()}
          >
            {
              loading 
              ? <ActivityIndicator
                  size="small" 
                  color={COLORS.white} 
                /> 
              : <Text style={styles.buttonText}>Войти</Text>
            }
          </TouchableOpacity>
          {biometricData && isBiometricSupportedAndAllowed && (
            <TouchableOpacity
              style={styles.textButton}
              disabled={!biometricData}
              onPress={() => authenticateWithBiometrics()}
            >
              <Text style={styles.buttonTextPrimary}>
                {loading ? "Загрузка" : "Использовать биометрию"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
