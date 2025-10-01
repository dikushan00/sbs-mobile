import React, { Fragment, useState } from "react";
import { View, Image, Dimensions, StyleSheet, Pressable } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { VideoView as Video, useVideoPlayer } from "expo-video";
import { useSelector } from "react-redux";
import { appState } from "@/services/redux/reducers/app";
import { getMediaTypeByExtension } from "@/utils";
const { width } = Dimensions.get("window");
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants";

type PropsType = {
  files: { file_url?: string }[];
};

export const Slider = ({ files }: PropsType) => {
  const { modal } = useSelector(appState);
  const ref = React.useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue<number>(0);

  return (
    <View style={{ height: "80%" }}>
      <Carousel
        loop
        width={width}
        autoPlay={false}
        defaultIndex={modal.data?.activeIndex || 0}
        onProgressChange={(_, index) => setActiveIndex(index)}
        data={files}
        renderItem={({ index, item }) => {
          return (
            <Fragment>
              {getMediaTypeByExtension(item.file_url) === "video" ? (
                <VideoComponent src={item.file_url || ""} />
              ) : (
                <Image source={{ uri: item.file_url }} style={styles.image} />
              )}
            </Fragment>
          );
        }}
      />
    </View>
  );
};

export const VideoComponent = ({
  src,
  style = {},
  canPlay = true,
  onClick,
}: {
  src: string;
  style?: any;
  canPlay?: boolean;
  onClick?: () => void;
}) => {
  const player = useVideoPlayer(src, (player) => {
    if (!canPlay) return;
    player.loop = false;
    // player.play();
  });

  return (
    <View style={{ ...styles.video, ...style }}>
      {onClick && (
        <Pressable
          style={{
            ...styles.video,
            ...style,
            backgroundColor: "transparent",
            position: "absolute",
            zIndex: 1,
          }}
          onPress={() => onClick && onClick()}
        >
          <FontAwesome5
            style={styles.videoIcon}
            name="play-circle"
            size={25}
            color={COLORS.primary}
          />
        </Pressable>
      )}
      <Video
        style={{ ...styles.video, ...style }}
        nativeControls={canPlay}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    backgroundColor: "rgba(0,0,0, .1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  paginationContainer: {
    paddingVertical: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: 500,
    backgroundColor: "rgba(0,0,0, .1)",
    alignSelf: "center",
  },
  videoIcon: { marginVertical: "auto", marginHorizontal: "auto" },
});
