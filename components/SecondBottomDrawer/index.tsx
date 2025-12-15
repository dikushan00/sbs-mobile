import { appState, closeSecondBottomDrawer } from "@/services/redux/reducers/app";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CustomLoader } from "../common/CustomLoader";
import { getBottomDrawerContent } from "../BottomDrawer/services";
import { userAppState } from "@/services/redux/reducers/userApp";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SecondBottomDrawer = () => {
  const dispatch = useDispatch();
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const {
    secondBottomDrawerData: { show, type, data, loading },
  } = useSelector(appState);
  const { isOkk } = useSelector(userAppState);
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [measuredContentHeight, setMeasuredContentHeight] = useState<number>(0);

  useEffect(() => {
    if (bottomSheetRef.current) {
      if (show) {
        bottomSheetRef.current.snapToIndex(0);
      } else {
        bottomSheetRef.current?.close();
      }
    }
  }, [show]);

  const contentData = useMemo(() => {
    if (!type) return null;
    return getBottomDrawerContent(isOkk)[type];
  }, [type, isOkk]);

  const handleSnapChange = (index: number) => {
    Animated.timing(animatedOpacity, {
      toValue: index >= 0 ? 1 : 0,
      duration: 1,
      useNativeDriver: true,
    }).start();
    if (index === -1) {
      bottomSheetRef.current?.close();
    }
  };

  const handleClose = () => {
    if (loading) return;
    if (data?.onClose) return data.onClose();
    dispatch(closeSecondBottomDrawer());
    bottomSheetRef.current?.close();
  };

  const onContentSizeChange = useCallback((_: number, height: number) => {
    setMeasuredContentHeight(height);
  }, []);

  const disableDrag = (data as any)?.disableDrag ?? false;
  const useContentHeight = (data as any)?.useContentHeight ?? true;
  const maxDynamicContentSize =
    (data as any)?.maxDynamicContentSize ??
    Math.max(0, windowHeight - insets.top - 16);

  const resolvedSnapPoints = useMemo(() => {
    if (!useContentHeight) {
      return (data as any)?.snapPoints || contentData?.snapPoints || ["40%"];
    }

    const HANDLE_ESTIMATE = 56;
    const desired = Math.min(
      maxDynamicContentSize,
      Math.max(1, measuredContentHeight + HANDLE_ESTIMATE)
    );
    return [desired];
  }, [useContentHeight, data, contentData?.snapPoints, measuredContentHeight, maxDynamicContentSize]);

  const Component = contentData?.component;
  return (
    <React.Fragment>
      {show && (
        <Pressable style={styles.overlayPress} onPress={handleClose}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: animatedOpacity,
              },
            ]}
          />
        </Pressable>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        style={styles.bottomSheet}
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose={!disableDrag}
        enableOverDrag={false}
        activeOffsetY={!disableDrag ? [-9999, 8] : undefined}
        bottomInset={insets.bottom}
        enableHandlePanningGesture={!disableDrag}
        enableContentPanningGesture={!disableDrag}
        handleComponent={() => (
          <View style={styles.handleContainer}>
            <View style={styles.dragLineContainer}>
              <View style={styles.dragLine} />
            </View>
            {loading && <CustomLoader style={{ marginTop: 10 }} />}
          </View>
        )}
        onChange={handleSnapChange}
        onClose={() => show && dispatch(closeSecondBottomDrawer())}
      >
        <BottomSheetScrollView
          nestedScrollEnabled
          contentContainerStyle={styles.contentContainer}
          onContentSizeChange={onContentSizeChange}
        >
          {!!Component && <Component data={data} handleClose={handleClose} />}
        </BottomSheetScrollView>
      </BottomSheet>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
  },
  overlayPress: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  contentContainer: {
    backgroundColor: "#fff",
  },
  handleContainer: {
    padding: 10,
    borderRadius: 16,
  },
  dragLineContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dragLine: {
    height: 4,
    width: 32,
    backgroundColor: "#E0E0E0",
    borderRadius: 16,
  },
});
