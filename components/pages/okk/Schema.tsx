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
  PanGestureHandler,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
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
  const panRef = useRef(null);
  const tapRef = useRef(null);
  const pinchRef = useRef(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseScale = useSharedValue(1);
  const pinchScale = useSharedValue(1);
  const isPinching = useSharedValue(false);

  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const schemaFileName = useMemo(() => {
    if (!data?.file_url) return;
    const fileName = data.file_url.split("/").reverse()[0];
    return fileName;
  }, [data]);

  const checkIfFileExist = useCallback(async () => {
    if (!schemaFileName) return;
    const fileInfo = await getFileInfo(schemaFileName);
    setDownloaded(!!fileInfo?.exists);
    if (!fileInfo?.exists && data?.file_url)
      downloadSchemaImage(data?.file_url);
  }, [schemaFileName, data]);

  useEffect(() => {
    if (!data?.file_url) return;
    const uri = downloaded
      ? `${FileSystem.documentDirectory}${schemaFileName}`
      : `${apiUrl}${data?.file_url}`;

    const getSize = async () => {
      if (downloaded && Platform.OS === "android") {
        const res = await getImageSize(uri);
        if (!res) {
          Image.getSize(
            uri,
            (w, h) => setImageSize({ width: w, height: h }),
            (err) => console.log(err)
          );
          return;
        }
        setImageSize(res);
      } else {
        Image.getSize(
          uri,
          (w, h) => setImageSize({ width: w, height: h }),
          (err) => console.log(err)
        );
      }
    };

    getSize();
  }, [data, downloaded, schemaFileName]);

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
  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX / totalScale.value;
      translateY.value = ctx.startY + event.translationY / totalScale.value;
    },
  });

  const pinchHandler =
    useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
      onStart: () => {
        isPinching.value = true;
      },
      onActive: (event) => {
        pinchScale.value = event.scale;
      },
      onEnd: () => {
        const zoom = baseScale.value * pinchScale.value;
        baseScale.value = zoom;
        let clampedZoom = Math.max(1, Math.min(zoom, 15));
        runOnJS(setZoomValue)(clampedZoom);

        pinchScale.value = 1;
        baseScale.value = clampedZoom;

        isPinching.value = false;
      },
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: totalScale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const onZoomChange = (zoom: number, zoomWithTiming: any) => {
    baseScale.value = zoomWithTiming;
    const timeout = setTimeout(() => {
      setZoomValue(zoom);
      clearTimeout(timeout);
      return;
    }, 300);
  };

  useEffect(() => {
    checkIfFileExist();
  }, [checkIfFileExist]);

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
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={panHandler}
        simultaneousHandlers={[tapRef, pinchRef]}
      >
        <Animated.View
          pointerEvents={"box-none"}
          style={[styles.container, animatedStyle]}
        >
          <PinchGestureHandler
            ref={pinchRef}
            onGestureEvent={pinchHandler}
            simultaneousHandlers={panRef}
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
                        ? `${FileSystem.documentDirectory}${schemaFileName}`
                        : `${apiUrl}${data?.file_url}`,
                    }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  <Svg
                    width={width}
                    height={schemaHeight}
                    style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
                  >
                    {displayedSize &&
                      computedPoints?.map((pt: PointType) => (
                        <Circle
                          key={
                            pt.call_check_list_point_id
                              ? String(pt.call_check_list_point_id)
                              : pt.id
                          }
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

                    {/* {displayedSize &&
                      data?.points?.map((pt: PointCoordType) => (
                        pt.coord_type === 'LINESTRING' && <Line
                          key={String(pt.floor_param_id)}
                          x1={pt.points[0][0] * displayedSize.scale + displayedSize.offsetX}
                          y1={pt.points[0][1] * displayedSize.scale + displayedSize.offsetY}
                          x2={pt.points[1][0] * displayedSize.scale + displayedSize.offsetX}
                          y2={pt.points[1][1] * displayedSize.scale + displayedSize.offsetY}
                          stroke={pt.floor_param_type_color || "#333"}
                          strokeWidth={1.5}
                        />
                      ))} */}
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
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
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
