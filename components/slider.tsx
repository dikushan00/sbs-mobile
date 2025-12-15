import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  Pressable,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { VideoView as Video, useVideoPlayer } from "expo-video";
import { useSelector } from "react-redux";
import { appState } from "@/services/redux/reducers/app";
import { getMediaTypeByExtension } from "@/utils";
const { width } = Dimensions.get("window");
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants";

type PropsType = {
  files?: { file_url?: string }[];
};

export const Slider = ({ files }: PropsType) => {
  const { modal } = useSelector(appState);
  const listRef = useRef<FlatList<{ file_url?: string }>>(null);
  const data = useMemo(() => files ?? [], [files]);
  const [activeIndex, setActiveIndex] = useState(0);

  const defaultIndexRaw = modal.data?.activeIndex ?? 0;
  const defaultIndex =
    data.length > 0 ? Math.min(Math.max(defaultIndexRaw, 0), data.length - 1) : 0;

  useEffect(() => {
    if (!data.length) return;
    setActiveIndex(defaultIndex);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: defaultIndex, animated: false });
    });
  }, [defaultIndex, data.length]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(x / width);
    setActiveIndex(nextIndex);
  };

  return (
    <View style={{ height: "80%" }}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item, index) => `${item?.file_url ?? "file"}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => {
          return (
            <View style={{ width }}>
              <Fragment>
                {getMediaTypeByExtension(item.file_url) === "video" ? (
                  <VideoComponent src={item.file_url || ""} />
                ) : (
                  <Image source={{ uri: item.file_url }} style={styles.image} />
                )}
              </Fragment>
            </View>
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
