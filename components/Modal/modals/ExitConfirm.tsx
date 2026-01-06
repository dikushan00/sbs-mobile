import { COLORS } from "@/constants";
import { closeModal } from "@/services/redux/reducers/app";
import { StyleSheet, Text, TouchableOpacity, View, BackHandler } from "react-native";
import { useDispatch } from "react-redux";
import { FontAwesome5 } from "@expo/vector-icons";

export const ExitConfirm = () => {
  const dispatch = useDispatch();

  const handleCancel = () => {
    dispatch(closeModal());
  };

  const handleExit = () => {
    dispatch(closeModal());
    BackHandler.exitApp();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <FontAwesome5 name="door-open" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Выход из приложения</Text>
        <Text style={styles.message}>Вы уверены, что хотите выйти?</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Text style={styles.exitButtonText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 320,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "RobotoBold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "RobotoRegular",
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "RobotoMedium",
    color: "#666",
  },
  exitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  exitButtonText: {
    fontSize: 16,
    fontFamily: "RobotoMedium",
    color: "#fff",
  },
});

