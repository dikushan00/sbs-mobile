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
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { FloorSchemaResRefactorType, FlatType, WorkSetFloorParamType, FloorCheckPoint } from "@/components/main/types";
import { downloadSchemaImage, getCircleRadius, getCircleStrokeWidth, getImageSize, PointType } from "../okk/services";
import { SchemaZoomControl } from "../okk/SchemaZoomControl";
import { getFloorMapPoints } from "@/components/main/services";
import { useDispatch } from "react-redux";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { BOTTOM_DRAWER_KEYS } from "@/components/BottomDrawer/services";

const { width } = Dimensions.get("window");
export const schemaHeight = 400;

type PropsType = {
  data: FloorSchemaResRefactorType | null;
  selectedFlat: FlatType | null;
  workSetParams: WorkSetFloorParamType[] | null;
  showCheckPoints?: boolean;
  handlePress: (event: any) => void;
};
export const FloorSchema = ({
  data,
  selectedFlat,
  workSetParams,
  showCheckPoints = true,
  handlePress,
}: PropsType) => {
  const dispatch = useDispatch();
  const [checkPoints, setCheckPoints] = useState<FloorCheckPoint[]>([]);
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
    if (!data?.floor_map.image_url) return;
    const fileName = data?.floor_map.image_url.split("/").reverse()[0];
    return fileName;
  }, [data]);

  useEffect(() => {
    if(data?.floor_map.floor_map_id) {
      getFloorMapPoints(data?.floor_map.floor_map_id, {}).then((res) => {
        if(!res) return;
        setCheckPoints(res);
      });
    }
  }, [data?.floor_map]);

  const checkIfFileExist = useCallback(async () => {
    if (!schemaFileName) return;
    const fileInfo = await getFileInfo(schemaFileName);
    setDownloaded(!!fileInfo?.exists);
    if (!fileInfo?.exists && data?.floor_map.image_url)
      downloadSchemaImage(data?.floor_map.image_url);
  }, [schemaFileName, data]);

  useEffect(() => {
    if (!data?.floor_map.image_url) return;
    const uri = downloaded
      ? `${FileSystem.documentDirectory}${schemaFileName}`
      : `${apiUrl}${data?.floor_map.image_url}`;

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

  const workSetParamIds = useMemo(() => {
    if (!workSetParams || workSetParams.length === 0) return new Set();
    return new Set(workSetParams.map(param => param.floor_param_id));
  }, [workSetParams]);

  const filteredLines = useMemo(() => {
    let lines = data?.lines || [];
    
    if (selectedFlat) {
      lines = lines.filter(line => line.floor_flat_id === selectedFlat.floor_flat_id);
    }
    return lines;
  }, [data?.lines, selectedFlat]);

  const filteredCircles = useMemo(() => {
    let circles = data?.circles || [];
    
    if (selectedFlat) {
      circles = circles.filter(circle => circle.floor_flat_id === selectedFlat.floor_flat_id);
    }
    return circles;
  }, [data?.circles, selectedFlat]);

  const filteredTexts = useMemo(() => {
    let texts = data?.texts || [];
    
    if (selectedFlat) {
      texts = texts.filter(text => text.floor_flat_id === selectedFlat.floor_flat_id);
    }
    return texts;
  }, [data?.texts, selectedFlat]);

  const handleSchemaClick = (e: any) => {
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
    
  const getCircleStrokeColor = (
    pt: FloorCheckPoint,
  ) => {
    if (pt.is_accepted) return "#006600";
    if (pt.is_accepted === false) return "red";
    return COLORS.primary;
  };

  const getPointBackground = (pt: FloorCheckPoint) => {
    if (pt.is_accepted) return "green";
    if (pt.is_accepted === false) return "red";
    return COLORS.primary;
  };

  const showPointData = (pt: FloorCheckPoint) => {
    if (!data?.floor_map.floor_map_id) {
      return;
    }
    
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.pointInfo,
      data: {
        floor_map_id: data.floor_map.floor_map_id,
        point: pt
      }
    }));
  };

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
                        : `${apiUrl}${data?.floor_map.image_url}`,
                    }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  <Svg
                    width={width}
                    height={schemaHeight}
                    style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
                  >
                    {displayedSize && (
                      <>
                        {/* Отрисовка линий */}
                        {filteredLines?.map((pt) => {
                          const isWorkSetParam = workSetParamIds.has(pt.floor_param_id);
                          return pt.coord_type === 'LINESTRING' && <Line
                            key={String(pt.floor_param_id)}
                            x1={pt.points[0][0] * displayedSize.scale + displayedSize.offsetX}
                            y1={pt.points[0][1] * displayedSize.scale + displayedSize.offsetY}
                            x2={pt.points[1][0] * displayedSize.scale + displayedSize.offsetX}
                            y2={pt.points[1][1] * displayedSize.scale + displayedSize.offsetY}
                            stroke={!!workSetParams?.length ? isWorkSetParam ? 'red' : "#000000" : pt.floor_param_type_color || "#333"}
                            strokeWidth={1.5} strokeDasharray={pt.floor_param_type_id_relative ? '2 2' : ''}
                          />
                        })}
                        
                        {filteredCircles?.map((circle) => (
                          <Circle
                            key={String(circle.floor_param_id)}
                            cx={circle.center_point[0] * displayedSize.scale + displayedSize.offsetX}
                            cy={circle.center_point[1] * displayedSize.scale + displayedSize.offsetY}
                            r={1.7}
                            fill="transparent"
                            stroke={circle.floor_param_type_color || "#333"}
                            strokeWidth={1}
                          />
                        ))}
                        
                        {filteredTexts?.map((text) => (
                          <SvgText
                            key={String(text.floor_param_id)}
                            x={text.center_point[0] * displayedSize.scale + displayedSize.offsetX}
                            y={text.center_point[1] * displayedSize.scale + displayedSize.offsetY}
                            fontSize="3"
                            fill={"#000"}
                            textAnchor="middle"
                          >
                            {text.frame_name}
                          </SvgText>
                        ))}
                        {displayedSize && showCheckPoints && checkPoints && checkPoints.length > 0 && (
                          <>
                            {checkPoints.map((pt: FloorCheckPoint) => {
                              const circleX = pt.x * displayedSize.scale + displayedSize.offsetX;
                              const circleY = pt.y * displayedSize.scale + displayedSize.offsetY;
                              const circleRadius = getCircleRadius(zoomValue);
                              
                              return (
                                <Circle
                                  key={String(pt.call_check_list_point_id)}
                                  cx={circleX}
                                  cy={circleY}
                                  r={String(Math.max(circleRadius, 3))}
                                  fill={getPointBackground(pt)}
                                  stroke={getCircleStrokeColor(pt)}
                                  strokeWidth={Math.max(getCircleStrokeWidth(zoomValue), 1)}
                                  onPressIn={() => {
                                    showPointData(pt);
                                  }}
                                  pointerEvents="auto"
                                />
                              );
                            })}
                          </>
                        )}
                      </>
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
    height: schemaHeight,
    objectFit: "contain",
    opacity: 0.7,
  },
});
