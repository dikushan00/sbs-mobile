import { apiUrl, COLORS } from "@/constants";
import { getFileInfo } from "@/utils";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
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
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { FloorSchemaResRefactorType, FlatType, WorkSetFloorParamType, FloorCheckPoint } from "@/components/main/types";
import { downloadSchemaImage, getCircleRadius, getCircleStrokeWidth, getImageSize, schemaMaxZoom, schemaMinZoom } from "../okk/services";
import { SchemaZoomControl } from "../okk/SchemaZoomControl";
import { getFloorMapPoints } from "@/components/main/services";
import { useDispatch, useSelector } from "react-redux";
import { showBottomDrawer, appState } from "@/services/redux/reducers/app";
import { BOTTOM_DRAWER_KEYS } from "@/components/BottomDrawer/constants";

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
  const { bottomDrawerData } = useSelector(appState);
  const [checkPoints, setCheckPoints] = useState<FloorCheckPoint[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const [zoomValue, setZoomValue] = useState(1);
  const [activePointId, setActivePointId] = useState<number | null>(null);

  // Reset active point when bottom drawer closes
  useEffect(() => {
    if (!bottomDrawerData.show) {
      setActivePointId(null);
    }
  }, [bottomDrawerData.show]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseScale = useSharedValue(1);
  const pinchScale = useSharedValue(1);
  const isPinching = useSharedValue(false);
  
  // helpers to store gesture start positions
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // pinch helpers (keep focal point stable while zooming)
  const pinchStartScale = useSharedValue(1);
  const pinchStartTranslateX = useSharedValue(0);
  const pinchStartTranslateY = useSharedValue(0);
  const pinchFocalContentX = useSharedValue(0);
  const pinchFocalContentY = useSharedValue(0);

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

  const localUri = useMemo(() => {
    if (!schemaFileName) return null;
    return `${FileSystem.Paths.document.uri}${schemaFileName}`;
  }, [schemaFileName]);

  const remoteUri = useMemo(() => {
    if (!data?.floor_map.image_url) return null;
    return `${apiUrl}${data.floor_map.image_url}`;
  }, [data?.floor_map.image_url]);

  const ensureSchemaDownloaded = useCallback(async () => {
    if (!schemaFileName || !data?.floor_map.image_url) return false;

    const fileInfo = await getFileInfo(schemaFileName);
    if (fileInfo?.exists) {
      setDownloaded(true);
      return true;
    }

    const downloadedUri = await downloadSchemaImage(data.floor_map.image_url);
    if (downloadedUri) {
      setDownloaded(true);
      return true;
    }

    const fileInfoAfter = await getFileInfo(schemaFileName);
    const ok = !!fileInfoAfter?.exists;
    setDownloaded(ok);
    return ok;
  }, [schemaFileName, data?.floor_map.image_url]);

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

  useEffect(() => {
    setImageSize(null);
    setDownloaded(false);
  }, [schemaFileName, data?.floor_map.image_url]);

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

  // Transform origin is at center of view by default in RN.
  // Formulas with center origin:
  //   screen = (content - center) * scale + center + translate
  //   content = (screen - center - translate) / scale + center
  const centerX = width / 2;
  const centerY = schemaHeight / 2;

  // Pan gesture
  const panGesture = Gesture.Pan()
    .minDistance(6)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      // translate is in screen coords
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  // Track if we've initialized focal point (first onUpdate frame is more reliable than onStart)
  const pinchInitialized = useSharedValue(false);
  const lastFocalX = useSharedValue(0);
  const lastFocalY = useSharedValue(0);

  // Pinch gesture - zoom towards focal point (like maps/gallery)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      isPinching.value = true;
      pinchInitialized.value = false;
      pinchStartScale.value = baseScale.value;
      pinchStartTranslateX.value = translateX.value;
      pinchStartTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      // Initialize focal point on first update frame (more stable than onStart)
      if (!pinchInitialized.value) {
        pinchInitialized.value = true;
        lastFocalX.value = e.focalX;
        lastFocalY.value = e.focalY;
        // content = (screen - center - translate) / scale + center
        pinchFocalContentX.value =
          (e.focalX - centerX - translateX.value) / baseScale.value + centerX;
        pinchFocalContentY.value =
          (e.focalY - centerY - translateY.value) / baseScale.value + centerY;
        return;
      }

      // Calculate delta focal movement (when user moves fingers while zooming)
      const focalDeltaX = e.focalX - lastFocalX.value;
      const focalDeltaY = e.focalY - lastFocalY.value;
      lastFocalX.value = e.focalX;
      lastFocalY.value = e.focalY;

      const currentTotalScale = baseScale.value * pinchScale.value;
      const nextScale = Math.max(
        schemaMinZoom,
        Math.min(pinchStartScale.value * e.scale, schemaMaxZoom)
      );

      // Update content focal point if fingers moved
      if (Math.abs(focalDeltaX) > 0.5 || Math.abs(focalDeltaY) > 0.5) {
        pinchFocalContentX.value =
          (e.focalX - centerX - translateX.value) / currentTotalScale + centerX;
        pinchFocalContentY.value =
          (e.focalY - centerY - translateY.value) / currentTotalScale + centerY;
      }

      pinchScale.value = nextScale / pinchStartScale.value;

      // translate = screen - center - (content - center) * scale
      translateX.value = e.focalX - centerX - (pinchFocalContentX.value - centerX) * nextScale;
      translateY.value = e.focalY - centerY - (pinchFocalContentY.value - centerY) * nextScale;
    })
    .onEnd(() => {
      // Normalize: merge pinchScale into baseScale without visual change
      const finalZoom = baseScale.value * pinchScale.value;
      baseScale.value = finalZoom;
      pinchScale.value = 1;
      pinchInitialized.value = false;

      runOnJS(setZoomValue)(finalZoom);
      isPinching.value = false;
    });

  const handleTap = useCallback(
    (payload: { x: number; y: number; tx: number; ty: number; s: number }) => {
      if (!displayedSize || !imageSize) return;

      // Undo current transform applied to the content
      // With center origin: screen = (content - center) * scale + center + translate
      // => content = (screen - center - translate) / scale + center
      const tapX = (payload.x - centerX - payload.tx) / payload.s + centerX;
      const tapY = (payload.y - centerY - payload.ty) / payload.s + centerY;

      // 1) First: hit-test existing checkPoints so "tap on circle" always wins
      if (showCheckPoints && checkPoints && checkPoints.length > 0) {
        const extraHit = 14 / Math.max(1, payload.s);
        const hitRadius = Math.max(getCircleRadius(zoomValue), 3) + extraHit;
        const hitRadius2 = hitRadius * hitRadius;

        const hitPoint = checkPoints.find((pt) => {
          const cx = pt.x * displayedSize.scale + displayedSize.offsetX;
          const cy = pt.y * displayedSize.scale + displayedSize.offsetY;
          const dx = tapX - cx;
          const dy = tapY - cy;
          return dx * dx + dy * dy <= hitRadius2;
        });

        if (hitPoint) {
          showPointData(hitPoint);
          return;
        }
      }

      // 2) Otherwise: treat as schema click
      const xOnImage = (tapX - displayedSize.offsetX) / displayedSize.scale;
      const yOnImage = (tapY - displayedSize.offsetY) / displayedSize.scale;

      if (
        xOnImage < 0 ||
        yOnImage < 0 ||
        xOnImage > imageSize.width ||
        yOnImage > imageSize.height
      ) {
        return;
      }

      handlePress({ x: xOnImage, y: yOnImage });
    },
    [
      checkPoints,
      displayedSize,
      imageSize,
      showCheckPoints,
      handlePress,
      zoomValue,
    ]
  );

  const showPointData = (pt: FloorCheckPoint) => {
    if (!data?.floor_map.floor_map_id) {
      return;
    }
    
    // Set active point to highlight it
    setActivePointId(pt.call_check_list_point_id);
    
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.pointInfo,
      data: {
        floor_map_id: data.floor_map.floor_map_id,
        point: pt
      }
    }));
  };

  const tapGesture = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e) => {
      runOnJS(handleTap)({
        x: e.x,
        y: e.y,
        tx: translateX.value,
        ty: translateY.value,
        s: totalScale.value,
      });
    });

  // Combine gestures — allow simultaneous pan + pinch + tap
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    tapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: totalScale.value },
    ],
  }));

  const onZoomChange = (zoom: number, animated: boolean) => {
    // Zoom from center of the screen (like maps/gallery)
    const currentScale = baseScale.value;
    const contentAtCenterX = -translateX.value / currentScale + centerX;
    const contentAtCenterY = -translateY.value / currentScale + centerY;

    // New translate: tx = -(contentAtCenter - centerX) * newScale
    const newTranslateX = -(contentAtCenterX - centerX) * zoom;
    const newTranslateY = -(contentAtCenterY - centerY) * zoom;

    if (animated) {
      // Use same timing config for all animations to keep them in sync
      const timingConfig = { duration: 250 };
      translateX.value = withTiming(newTranslateX, timingConfig);
      translateY.value = withTiming(newTranslateY, timingConfig);
      baseScale.value = withTiming(zoom, timingConfig);
      setTimeout(() => setZoomValue(zoom), 250);
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
      baseScale.value = zoom;
      setZoomValue(zoom);
    }
  };

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
    
  const getCircleStrokeColor = (pt: FloorCheckPoint) => {
    // Active point gets primary color stroke
    if (pt.call_check_list_point_id === activePointId) {
      return COLORS.primary;
    }
    if (pt.is_accepted) return "#006600";
    if (pt.is_accepted === false) return "red";
    return COLORS.primary;
  };

  const getPointBackground = (pt: FloorCheckPoint) => {
    // Active point gets primary color fill
    if (pt.call_check_list_point_id === activePointId) {
      return COLORS.primary;
    }
    if (pt.is_accepted) return "green";
    if (pt.is_accepted === false) return "red";
    return COLORS.primary;
  };

  return (
    <GestureHandlerRootView style={{ height: schemaHeight }}>
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
          scale={baseScale}
          zoomValue={zoomValue}
          setZoomValue={setZoomValue}
        />

        <GestureDetector gesture={composedGesture}>
          <View
            collapsable={false}
            style={{ width, height: schemaHeight }}
          >
            <Animated.View
              pointerEvents={"box-none"}
              style={[styles.container, animatedStyle]}
            >
              <Animated.View style={{ flex: 1 }}>
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
                        : `${apiUrl}${data?.floor_map.image_url}`,
                    }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  <Svg
                    width={width}
                    height={schemaHeight}
                    pointerEvents="none"
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
                        {showCheckPoints && checkPoints && checkPoints.length > 0 && (
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
                                />
                              );
                            })}
                          </>
                        )}
                      </>
                    )}
                  </Svg>
                </View>
              </Animated.View>
            </Animated.View>
          </View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: schemaHeight,
  },
  image: {
    height: schemaHeight,
    objectFit: "contain",
    opacity: 0.7,
  },
});
