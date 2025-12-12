import { COLORS, FONT } from "@/constants";
import { useMemo } from "react";
import { StyleSheet, Text, ViewStyle, ActivityIndicator, View, TouchableOpacity } from "react-native";

type PropsType = {
  title?: string;
  type?: "contained" | "text" | "outlined" | "elevated" | "contained-tonal";
  onClick: () => void;
  small?: boolean;
  color?: string;
  alignSelf?: any;
  disabled?: boolean;
  allWidth?: boolean;
  autoHeight?: boolean;
  childrenRight?: boolean;
  children?: any;
  stylesProps?: ViewStyle;
  textStyles?: ViewStyle;
  btnContentStyles?: ViewStyle;
  wrapperStyles?: ViewStyle;
  loading?: boolean;
};
export const CustomButton = ({
  title = "",
  color = "",
  type = "outlined",
  allWidth = true,
  small = false,
  childrenRight = false,
  stylesProps = {},
  wrapperStyles = {},
  btnContentStyles = {},
  textStyles = {},
  autoHeight = false,
  disabled = false,
  alignSelf = "auto",
  loading = false,
  onClick,
  children,
}: PropsType) => {
  const buttonStyles = useMemo(() => {
    if (type === "contained") {
      return {
        backgroundColor: disabled
          ? color !== COLORS.primary
            ? COLORS.disabled
            : COLORS.primaryDisabled
          : color || COLORS.primary,
        border: 0,
        borderWidth: 0,
      };
    }
    return {
      backgroundColor: COLORS.white,
      borderColor: disabled
        ? color !== COLORS.primary
          ? COLORS.disabled
          : COLORS.primaryDisabled
        : COLORS.primaryBorder,
      borderWidth: 2,
    };
  }, [type, disabled, color]);

  const textColor = useMemo(() => {
    return type === "outlined"
      ? disabled
        ? color !== COLORS.primary
          ? COLORS.disabled
          : COLORS.primaryDisabled
        : COLORS.primary
      : disabled ? '#757575' : COLORS.white;
  }, [type, disabled, color]);

  const handleClick = () => {
    if (disabled || loading) return;
    onClick && onClick();
  };


  return (
    <View
      style={{
        height: small ? (autoHeight ? "auto" : 44) : 64,
        backgroundColor: "transparent",
        borderRadius: small ? 8 : 12,
        minHeight: 30,
        ...wrapperStyles, 
      }}
    >
      <TouchableOpacity
        activeOpacity={disabled || loading ? 1 : 0.7}
        disabled={disabled || loading}
        style={
          {
            width: small ? "auto" : "100%",
            alignSelf: alignSelf || "auto",
            height: small ? (autoHeight ? "auto" : 44) : 64,
            borderRadius: small ? 8 : 12,
            ...styles.button,
            ...buttonStyles,
            ...stylesProps,
          } as ViewStyle
        }
        onPress={handleClick}
      >
        <View
          style={{
            ...styles.buttonContent,
            paddingHorizontal: 10,
            backgroundColor: "transparent",
            width: small ? "auto" : "100%",
          }}
        >
          <View style={[styles.btnContent, btnContentStyles || {}]}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={type === "contained" ? COLORS.white : COLORS.primary}
              />
            ) : (
              <>
                {children && !childrenRight && children}
                {!!title && (
                  <Text
                    style={{
                      ...styles.buttonText,
                      fontSize: small ? 14 : 16,
                      fontFamily: FONT.medium,
                      color: textColor,
                      ...textStyles,
                    }}
                  >
                    {title || ""}
                  </Text>
                )}
                {children && childrenRight && children}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
  buttonContent: {
    height: "100%",
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    gap: 7,
    minWidth: 10,
    height: "100%",
  },
});
