import { PAGE_NAMES } from "@/constants";
import { AuthRegisterData } from "@/services/types";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CustomLoader } from "../common/CustomLoader";
import { useSnackbar } from "../snackbar/SnackbarContext";
import styles from "./login.style";
import { registerNewContractor } from "./services";

export const RegisterForm = () => {
  const navigation = useNavigation();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [formData, setFormData] = useState<AuthRegisterData>({
    login: "",
    fio: "",
    password: "",
    password_repeat: "",
  });
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
    const body = { ...formData };
    if (formData.password !== formData.password_repeat)
      return showErrorSnackbar("Пароли не совпадают!");
    setLoading(true);
    const res = await registerNewContractor(body);
    setLoading(false)
    if (!res) return;
    setFormData({
      login: "",
      fio: "",
      password: "",
      password_repeat: "",
    })
    showSuccessSnackbar("Заявка на регистрацию успешно отправлена, пожалуйста, подождите обратной связи");
    navigation.navigate(PAGE_NAMES.login as never);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View>
          <CustomLoader />
        </View>
      )}
      <View style={styles.contentContainerRegister}>
        <View style={styles.formContainerRegister}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={formData.fio}
          placeholderTextColor="#BABABA"
          onChangeText={(text) => onChange("fio", text)}
          placeholder={"ФИО"}
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={formData.login}
          placeholderTextColor="#BABABA"
          onChangeText={(text) => onChange("login", text)}
          placeholder={"Email"}
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={formData.password}
          placeholderTextColor="#BABABA"
          onChangeText={(text) => onChange("password", text)}
          placeholder={"Пароль"}
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={formData.password_repeat}
          placeholderTextColor="#BABABA"
          onChangeText={(text) => onChange("password_repeat", text)}
          placeholder={"Повторите пароль"}
        />
      </View>
      </View>

      <TouchableOpacity
        disabled={loading}
        style={styles.button}
        onPress={() => onSubmit()}
      >
        <Text style={styles.buttonText}>Регистрация</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.textButton}
        onPress={() => navigation.navigate(PAGE_NAMES.login as never)}
      >
        <Text style={styles.buttonTextPrimary}>Войти</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};
