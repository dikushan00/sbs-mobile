const COLORS = {
  primary: "#134686",
  primaryLight: "#0060FE",
  red: "red",
  primaryDisabled: "rgba(19, 116, 207, 0.25)",
  disabled: "#dedede",
  primaryBorder: "rgba(19, 116, 207, 0.5)",
  backgroundWhite: "#fff",
  background: "#F2F5F8",
  primaryBackground: "#EAF5FF",
  primaryBackgroundHard: "#a1c0dd",
  secondary: "#444262",
  tertiary: "#FF7754",
  error: "#FB4F57",
  errorBackground: "#ffa2a6",
  errorBackgroundLight: "#ffc6c8",
  warning: "#ff9800",
  yellow: "rgb(231, 184, 64)",
  edit: "#d9993e",
  info: "#2196f3",
  green: "#19A619",
  greenLight: "#5C9E5C",
  success: "#11AC59",
  successLight: "#a2f4c8",
  successGradient: "linear-gradient(91.72deg, #37B908 9.72%, #11AC59 90.28%)",

  gray: "#83829A",
  darkGray: "#757575",
  gray2: "#C1C0C8",
  black: "#000",
  dark: "#000",

  white: "#FFF",
  lightWhite: "#FAFAFC",
};
const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";
export const THEMES = {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};

const FONT = {
  regular: "RobotoRegular",
  medium: "Roboto_500Medium",
  semiBold: "RobotoMono_600SemiBold",
  bold: "RobotoBold",
};

const SIZES = {
  xxSmall: 5,
  xSmall: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 32,
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};

export { COLORS, FONT, SIZES, SHADOWS };
