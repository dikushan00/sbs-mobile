import { PAGE_NAMES } from "@/constants";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CustomLoader } from "../common/CustomLoader";
import { useSnackbar } from "../snackbar/SnackbarContext";
import styles from "./login.style";
import { requestNewPassword } from "./services";
import LogoBlue from "@/assets/images/logo_blue.svg";

export const ForgetPasswordForm = () => {
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

    setLoading(true);
    const res = await requestNewPassword(formData);
    setLoading(false);
    if (!res) return;
    showSuccessSnackbar(
      "Новый пароль был отправлен на указанную почту"
    );
    navigation.navigate(PAGE_NAMES.login as never);
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
              value={formData.email}
              onChangeText={(text) => onChange("email", text)}
              placeholder={"Электронная почта"}
            />
          </View>
        </View>
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            disabled={loading}
            style={styles.button}
            onPress={() => onSubmit()}
          >
            <Text style={styles.buttonText}>Сбросить пароль</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => navigation.navigate(PAGE_NAMES.login as never)}
          >
            <Text style={styles.buttonTextPrimary}>Войти</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
