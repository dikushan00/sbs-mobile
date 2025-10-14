import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { Icon } from "@/components/Icon";
import { useDispatch, useSelector } from "react-redux";
import { logout, userAppState } from "@/services/redux/reducers/userApp";
import { AppDispatch } from "@/services/redux";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { logoutLoading } = useSelector(userAppState);
  const handleLogout = () => {
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти из приложения?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Выйти",
          style: "destructive",
          onPress: () => {
            if (logoutLoading) return;
            dispatch(logout());
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Профиль</Text>
        <Text style={styles.description}>Страница профиля пользователя.</Text>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" width={20} height={20} />
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 25,
    justifyContent: "space-between"
  },
  content: {
    flex: 1,
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  description: { fontSize: 14, color: "#666" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});

