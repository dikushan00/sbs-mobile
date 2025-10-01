import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    paddingHorizontal: SIZES.medium,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  bottomButtonsContainer: {
    paddingBottom: 20,
  },
  inputWrapper: {
    backgroundColor: COLORS.white,
    marginRight: SIZES.small,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.medium,
    height: 50,
    width: "100%",
    marginTop: 15,
  },
  input: {
    width: "100%",
    height: "100%",
    padding: SIZES.medium,
    backgroundColor: "#efefef",
    borderRadius: 12,
  },
  button: {
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    height: 55,
    paddingVertical: SIZES.xxSmall,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "600",
  },
  buttonTextPrimary: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 10,
  },
  buttonTextPrimaryLight: {
    fontSize: SIZES.medium,
    color: COLORS.primaryLight,
    textAlign: "left",
  },
  textButton: {
    paddingVertical: SIZES.xSmall,
    textAlign: "left",
    color: COLORS.primaryLight,
  },
  buttonMargin: {
    marginTop: 15,
    backgroundColor: "#3563e3",
    paddingVertical: SIZES.xSmall,
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
    marginTop: 20,
  },
});

export default styles;
