import { COLORS, FONT } from "@/constants";
import React, { createContext, useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Portal } from "react-native-paper";
import Toast from "react-native-toast-message";
import { Icon } from "../Icon";

const SnackbarContext = createContext({
  showSuccessSnackbar: (message: string) => {},
  showErrorSnackbar: (message: string) => {},
});

export const SnackbarProvider = ({ children }: { children: any }) => {
  const showSuccessSnackbar = (message: string) => {
    Toast.show({
      type: "success",
      text1: message,
      position: "top",
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50
    });
  };

  const showErrorSnackbar = (message: string) => {
    Toast.show({
      type: "error",
      text1: message,
      position: "top",
      visibilityTime: 8000,
      autoHide: true,
      topOffset: 50
    });
  };

  return (
    <SnackbarContext.Provider
      value={{ showSuccessSnackbar, showErrorSnackbar }}
    >
      <Portal>
        <Toast config={CustomToast} />
      </Portal>
      {children}
    </SnackbarContext.Provider>
  );
};

const CustomToast = {
  success: ({ text1 }: any) => (
    <View
      style={{
        ...styles.wrapper,
        backgroundColor: COLORS.success,
      }}
    >
      <View style={styles.content}>
        <View style={styles.checkIcon}>
          <Icon name="checkCircle" />
        </View>
        <Text style={styles.text}>{text1}</Text>
      </View>
    </View>
  ),
  error: ({ text1, hide }: any) => {
    return (
      <View
        style={{
          ...styles.wrapper,
          backgroundColor: COLORS.error,
        }}
      >
        <View style={styles.content}>
          <Pressable onPress={hide}>
            <Icon name="closeCircle" />
          </Pressable>
          <Text style={styles.text}>{text1}</Text>
        </View>
      </View>
    );
  },
};

export const useSnackbar = () => useContext(SnackbarContext);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.success,
    padding: 15,
    borderRadius: 16,
    flex: 1,
    width: "95%",
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  text: {
    color: "#fff",
    fontFamily: FONT.medium,
    fontSize: 14,
    flex: 1,
  },
  checkIcon: {
    borderRadius: "50%",
    borderWidth: 6,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
});
