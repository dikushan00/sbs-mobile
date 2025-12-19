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
  withTiming,
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
  schemaMaxZoom,
  schemaMinZoom,
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

  const computedPoints = useMemo(() => {
    if (isEditable === false) return points;
    if (showAllPoints) return points;
    return points?.filter((item) => item.is_accepted !== true);
  }, [points, showAllPoints, isEditable]);

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

  // Pinch gesture - zoom towards focal point (like maps/gallery)
  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      isPinching.value = true;
      pinchStartScale.value = baseScale.value;
      pinchStartTranslateX.value = translateX.value;
      pinchStartTranslateY.value = translateY.value;

      // content = (screen - center - translate) / scale + center
      pinchFocalContentX.value =
        (e.focalX - centerX - pinchStartTranslateX.value) / pinchStartScale.value + centerX;
      pinchFocalContentY.value =
        (e.focalY - centerY - pinchStartTranslateY.value) / pinchStartScale.value + centerY;
    })
    .onUpdate((e) => {
      const nextScale = Math.max(
        schemaMinZoom,
        Math.min(pinchStartScale.value * e.scale, schemaMaxZoom)
      );

      pinchScale.value = nextScale / pinchStartScale.value;

      // translate = screen - center - (content - center) * scale
      translateX.value = e.focalX - centerX - (pinchFocalContentX.value - centerX) * nextScale;
      translateY.value = e.focalY - centerY - (pinchFocalContentY.value - centerY) * nextScale;
    })
    .onEnd(() => {
      const zoom = baseScale.value * pinchScale.value;
      const clampedZoom = Math.max(schemaMinZoom, Math.min(zoom, schemaMaxZoom));
      baseScale.value = clampedZoom;
      pinchScale.value = 1;

      runOnJS(setZoomValue)(clampedZoom);
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

      // 1) First: hit-test existing points so "tap on circle" always wins
      // keep extra hit slop ~constant in screen pixels
      const extraHit = 14 / Math.max(1, payload.s);
      const hitRadius = getCircleRadius(zoomValue) + extraHit;
      const hitRadius2 = hitRadius * hitRadius;

      const hitPoint = computedPoints?.find((pt) => {
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

      // 2) Otherwise: if editable, treat as adding a new point on the schema
      if (!isEditable) return;

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
      computedPoints,
      displayedSize,
      imageSize,
      isEditable,
      showPointData,
      handlePress,
      zoomValue,
    ]
  );

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

  const onZoomChange = (zoom: number, zoomWithTiming: any) => {
    // Zoom from center of the screen (like maps/gallery)
    // The focal point is screen center: (centerX, centerY)
    // content at center = (centerX - centerX - tx) / oldScale + centerX = -tx / oldScale + centerX
    const currentScale = baseScale.value;
    const contentAtCenterX = -translateX.value / currentScale + centerX;
    const contentAtCenterY = -translateY.value / currentScale + centerY;

    // New translate: tx = centerX - centerX - (contentAtCenter - centerX) * newScale
    //              = -(contentAtCenter - centerX) * newScale
    const newTranslateX = -(contentAtCenterX - centerX) * zoom;
    const newTranslateY = -(contentAtCenterY - centerY) * zoom;

    // Check if zoomWithTiming has animation (from buttons) or is just a number (from slider)
    const isAnimated = typeof zoomWithTiming === "object";

    if (isAnimated) {
      translateX.value = withTiming(newTranslateX, { duration: 300 });
      translateY.value = withTiming(newTranslateY, { duration: 300 });
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
    baseScale.value = zoomWithTiming;

    const timeout = setTimeout(() => {
      setZoomValue(zoom);
      clearTimeout(timeout);
    }, 300);
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

  return (
    // GestureHandlerRootView is recommended wrapper for gesture handler
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
                        : `${apiUrl}${data?.file_url}`,
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
                      />
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
    // width: width,
    height: schemaHeight,
    objectFit: "contain",
    opacity: 0.7,
  },
});
