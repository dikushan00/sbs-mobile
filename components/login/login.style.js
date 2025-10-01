import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    paddingHorizontal: SIZES.medium,
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
    borderRadius: 5,
  },
  button: {
    marginTop: 15,
    justifyContent: "center",
    backgroundColor: "#fa4747",
    height: 55,
    paddingVertical: SIZES.xxSmall,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    textAlign: "center",
  },
  buttonTextPrimary: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: "center",
  },
  textButton: {
    marginTop: 15,
    paddingVertical: SIZES.xSmall,
    textAlign: "center",
  },
  buttonMargin: {
    marginTop: 15,
    backgroundColor: "#3563e3",
    paddingVertical: SIZES.xSmall,
    borderRadius: 5,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
});

export default styles;
