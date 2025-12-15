import { apiUrl, COLORS } from "@/constants";
import { getFileInfo } from "@/utils";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { SchemaZoomControl } from "./SchemaZoomControl";
import {
  downloadSchemaImage,
  getCircleRadius,
  getCircleStrokeColor,
  getCircleStrokeWidth,
  getImageSize,
  PointType,
  OkkTaskType,
} from "./services";

const { width } = Dimensions.get("window");
export const schemaHeight = 400;

type PropsType = {
  data: OkkTaskType | null;
  activePointId: string | number | null;
  isEditable?: boolean;
  showAllPoints?: boolean;
  points: PointType[];
  activePoint: { x: number; y: number } | null;
  showPointData: (p: PointType) => void;
  handlePress: (event: any) => void;
};
export const Schema = ({
  data,
  points,
  activePoint,
  activePointId,
  showAllPoints = false,
  isEditable,
  showPointData,
  handlePress,
}: PropsType) => {
  const [downloaded, setDownloaded] = useState(false);
  const [zoomValue, setZoomValue] = useState(1);
  const tapRef = useRef(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseScale = useSharedValue(1);
  const pinchScale = useSharedValue(1);
  const isPinching = useSharedValue(false);

  // helpers to store gesture start positions
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const schemaFileName = useMemo(() => {
    if (!data?.file_url) return;
    const fileName = data.file_url.split("/").reverse()[0];
    return fileName;
  }, [data]);

  const localUri = useMemo(() => {
    if (!schemaFileName) return null;
    return `${FileSystem.Paths.document.uri}${schemaFileName}`;
  }, [schemaFileName]);

  const remoteUri = useMemo(() => {
    if (!data?.file_url) return null;
    return `${apiUrl}${data.file_url}`;
  }, [data?.file_url]);

  const ensureSchemaDownloaded = useCallback(async () => {
    if (!schemaFileName || !data?.file_url) return false;

    const fileInfo = await getFileInfo(schemaFileName);
    if (fileInfo?.exists) {
      setDownloaded(true);
      return true;
    }

    const downloadedUri = await downloadSchemaImage(data.file_url);
    if (downloadedUri) {
      setDownloaded(true);
      return true;
    }

    // In case downloadSchemaImage didn't return uri but file still ended up existing
    const fileInfoAfter = await getFileInfo(schemaFileName);
    const ok = !!fileInfoAfter?.exists;
    setDownloaded(ok);
    return ok;
  }, [schemaFileName, data?.file_url]);

  const getImageSizeForUri = useCallback(
    async (uri: string, isLocal: boolean) => {
      if (isLocal && Platform.OS === "android") {
        const res = await getImageSize(uri);
        if (res) return res;
      }

      return await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(
          uri,
          (w, h) => resolve({ width: w, height: h }),
          (err) => reject(err)
        );
      });
    },
    []
  );

  // When schema changes, reset cached values so we always re-calc on first open
  useEffect(() => {
    setImageSize(null);
    setDownloaded(false);
  }, [schemaFileName, data?.file_url]);

  useEffect(() => {
    ensureSchemaDownloaded();
  }, [ensureSchemaDownloaded]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!schemaFileName || !remoteUri) return;

      const uriToMeasure = downloaded && localUri ? localUri : remoteUri;

      try {
        const res = await getImageSizeForUri(uriToMeasure, !!(downloaded && localUri));
        if (!cancelled) setImageSize(res);
      } catch (e) {
        // Remote getSize can fail (e.g. protected URL). Fallback: download and measure local file.
        if (cancelled) return;
        const ok = await ensureSchemaDownloaded();
        if (!ok || !localUri) return;
        try {
          const res2 = await getImageSizeForUri(localUri, true);
          if (!cancelled) setImageSize(res2);
        } catch (e2) {}
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    schemaFileName,
    remoteUri,
    localUri,
    downloaded,
    ensureSchemaDownloaded,
    getImageSizeForUri,
  ]);

  const displayedSize = useMemo(() => {
    if (!imageSize || imageSize.width === 0) return null;
    const containerWidth = width;
    const containerHeight = schemaHeight;
    const scaleX = containerWidth / imageSize.width;
    const scaleY = containerHeight / imageSize.height;
    const scale = Math.min(scaleX, scaleY);
    const displayedWidth = imageSize.width * scale;
    const displayedHeight = imageSize.height * scale;
    const offsetX = (containerWidth - displayedWidth) / 2;
    const offsetY = (containerHeight - displayedHeight) / 2;
    return {
      width: displayedWidth,
      height: displayedHeight,
      offsetX,
      offsetY,
      scale,
    };
  }, [imageSize]);

  const totalScale = useDerivedValue(() => baseScale.value * pinchScale.value);

  // Pan gesture using new Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      // divide by totalScale so pan distance respects current zoom
      translateX.value = startX.value + e.translationX / totalScale.value;
      translateY.value = startY.value + e.translationY / totalScale.value;
    })
    .onEnd(() => {
      // Optional: clamp translation so image doesn't go too far
      // You can implement bounds here if needed.
    });

  // Pinch gesture using new Gesture API
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      isPinching.value = true;
    })
    .onUpdate((e) => {
      pinchScale.value = e.scale;
    })
    .onEnd(() => {
      const zoom = baseScale.value * pinchScale.value;
      const clampedZoom = Math.max(1, Math.min(zoom, 15)); // keep between 1 and 15
      baseScale.value = clampedZoom;
      pinchScale.value = 1;

      runOnJS(setZoomValue)(clampedZoom);
      isPinching.value = false;
    });

  // Combine gestures — allow simultaneous pan + pinch
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: totalScale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const onZoomChange = (zoom: number, zoomWithTiming: any) => {
    // zoomWithTiming previously was a reanimated value; here we directly set baseScale if needed
    baseScale.value = zoomWithTiming;
    const timeout = setTimeout(() => {
      setZoomValue(zoom);
      clearTimeout(timeout);
      return;
    }, 300);
  };

  const handleSchemaClick = (e: any) => {
    if (!isEditable) return;

    if (!displayedSize || !imageSize) return;

    const { locationX, locationY } = e.nativeEvent;

    const xOnImage = (locationX - displayedSize.offsetX) / displayedSize.scale;
    const yOnImage = (locationY - displayedSize.offsetY) / displayedSize.scale;

    if (
      xOnImage < 0 ||
      yOnImage < 0 ||
      xOnImage > imageSize.width ||
      yOnImage > imageSize.height
    ) {
      return;
    }

    const newPoint = { x: xOnImage, y: yOnImage };
    handlePress(newPoint);
  };

  const getPointBackground = (pt: PointType) => {
    if (
      pt.call_check_list_point_id &&
      pt.call_check_list_point_id === activePointId
    )
      return COLORS.primary;

    if (pt.id && pt.id === activePointId) return COLORS.primary;

    if (pt.point_is_accepted === "1") return "green";

    if (pt.point_is_accepted === "0") return "red";

    return "red";
  };

  const computedPoints = useMemo(() => {
    if (isEditable === false) return points;
    if (showAllPoints) return points;
    return points?.filter((item) => item.is_accepted !== true);
  }, [points, showAllPoints, isEditable]);

  return (
    // GestureHandlerRootView is recommended wrapper for gesture handler
    <GestureHandlerRootView style={{height: schemaHeight - 40}}>
      <View
        pointerEvents="box-none"
        style={{
          height: schemaHeight,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <SchemaZoomControl
          onZoomChange={onZoomChange}
          scale={totalScale}
          zoomValue={zoomValue}
          setZoomValue={setZoomValue}
        />

        <GestureDetector gesture={composedGesture}>
          <Animated.View
            pointerEvents={"box-none"}
            style={[styles.container, animatedStyle]}
          >
            <Animated.View style={{ flex: 1 }}>
              <Pressable
                ref={tapRef}
                onPress={handleSchemaClick}
                style={{
                  zIndex: 11,
                  width,
                  height: schemaHeight,
                }}
              >
                <View
                  style={{
                    zIndex: 11,
                    width: width,
                    height: schemaHeight,
                    backgroundColor: COLORS.white,
                  }}
                >
                  <Image
                    source={{
                      uri: downloaded
                        ? `${FileSystem.Paths.document.uri}${schemaFileName}`
                        : `${apiUrl}${data?.file_url}`,
                    }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  <Svg
                    width={width}
                    height={schemaHeight}
                    style={[StyleSheet.absoluteFill, { zIndex: 10 },
                    //   {
                    //   position: "absolute",
                    //   top: displayedSize?.offsetY,
                    //   left: displayedSize?.offsetX,
                    // }
                  ]}
                  >
                    {displayedSize &&
                      computedPoints?.map((pt: PointType) => (
                        <Circle
                          key={
                            pt.call_check_list_point_id
                              ? String(pt.call_check_list_point_id)
                              : pt.id
                          }
                          // cx={pt.x}
                          // cy={pt.y}
                          cx={
                            pt.x * displayedSize.scale + displayedSize.offsetX
                          }
                          cy={
                            pt.y * displayedSize.scale + displayedSize.offsetY
                          }
                          r={String(getCircleRadius(zoomValue))}
                          fill={getPointBackground(pt)}
                          stroke={getCircleStrokeColor(pt, activePointId)}
                          strokeWidth={getCircleStrokeWidth(zoomValue)}
                          onPress={() => showPointData(pt)}
                          pointerEvents="auto"
                        />
                      ))}

                    {activePoint && displayedSize && (
                      <Circle
                        cx={
                          activePoint.x * displayedSize.scale +
                          displayedSize.offsetX
                        }
                        cy={
                          activePoint.y * displayedSize.scale +
                          displayedSize.offsetY
                        }
                        r={String(getCircleRadius(zoomValue))}
                        fill="#ed6879"
                        stroke={COLORS.primary}
                        strokeWidth={getCircleStrokeWidth(zoomValue)}
                        pointerEvents="auto"
                      />
                    )}
                  </Svg>
                </View>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    gap: 10,
    height: schemaHeight,
  },
  image: {
    // width: width,
    height: schemaHeight,
    objectFit: "contain",
    opacity: 0.7,
  },
});
