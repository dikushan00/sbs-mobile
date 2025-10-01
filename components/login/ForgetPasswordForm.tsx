import { PAGE_NAMES } from "@/constants";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CustomLoader } from "../common/CustomLoader";
import { useSnackbar } from "../snackbar/SnackbarContext";
import styles from "./login.style";
import { requestNewPassword } from "./services";
import { useDispatch } from "react-redux";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/services";

export const ForgetPasswordForm = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({ email: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (name: string, text: string) => {
    setFormData((prev) => ({ ...prev, [name]: text }));
  };

  const onSubmit = async () => {
    const isAllFieldsFilled = Object.keys(formData).every(
      //@ts-ignore
      (item) => !!formData[item]
    );
    if (!isAllFieldsFilled) return showErrorSnackbar("Заполните все поля!");

    dispatch(
      showBottomDrawer({
        type: BOTTOM_DRAWER_KEYS.selectModule,
        data: {
          btnLabel: "Сбросить пароль",
          modules: [
            { type: "master", res: null },
            { type: "okk", res: null },
          ],
          onSubmit: async () => {
            setLoading(true);
            const res = await requestNewPassword(formData);
            setLoading(false);
            if (!res) return;
            showSuccessSnackbar(
              "Новый пароль был отправлен на указанную почту"
            );
            navigation.navigate(PAGE_NAMES.login as never);
          },
        },
      })
    );
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
          value={formData.email}
          onChangeText={(text) => onChange("email", text)}
          placeholder={"Email"}
        />
      </View>
      <TouchableOpacity
        disabled={loading}
        style={styles.button}
        onPress={() => onSubmit()}
      >
        <Text style={styles.buttonText}>Отправить</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.textButton}
        onPress={() => navigation.navigate(PAGE_NAMES.login as never)}
      >
        <Text style={styles.buttonTextPrimary}>Войти</Text>
      </TouchableOpacity>
    </View>
  );
};
