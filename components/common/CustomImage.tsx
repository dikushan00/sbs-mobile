import { FILE_URL_MAIN } from "@/constants";
import { useState } from "react";
import { Image, Pressable } from "react-native";

type PropsType = {
  src: string;
  defaultSrc?: string;
  alt?: boolean;
  style?: any;
  onClick?: () => void;
  widthOnError?: number | null;
  isStaticImg?: boolean;
  postFix?: string;
};

const logoPlaceholder = require("@/assets/images/placeholder.png");
export const CustomImage = ({
  src,
  defaultSrc = logoPlaceholder,
  alt,
  style = {},
  isStaticImg,
  widthOnError = null,
  postFix = FILE_URL_MAIN,
  onClick,
  ...other
}: PropsType) => {
  const [imageSource, setImageSource] = useState(
    src ? (isStaticImg ? src : { uri: src }) : logoPlaceholder
  );
  const onImgError = (e: any) => {
    setImageSource(logoPlaceholder);
  };

  if (onClick)
    return (
      <Pressable onPress={onClick}>
        <Image
          {...other}
          source={imageSource}
          onError={onImgError}
          style={{ maxWidth: "100%", ...style }}
        />
      </Pressable>
    );

  return (
    <Image
      {...other}
      source={imageSource}
      onError={onImgError}
      style={{ maxWidth: "100%", ...style }}
    />
  );
};
