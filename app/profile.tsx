import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      <Text>Страница профиля пользователя.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
});

