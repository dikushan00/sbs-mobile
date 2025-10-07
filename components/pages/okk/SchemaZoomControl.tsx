import { COLORS } from "@/constants";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import Slider from "@react-native-community/slider";
import { StyleSheet } from "react-native";
import { TouchableOpacity, View } from "react-native";
import { withTiming } from "react-native-reanimated";
import { schemaMaxZoom, schemaMinZoom } from "./services";

type PropsType = {
  onZoomChange: (zoom: number, a: any) => void;
  scale: any;
  zoomValue: number;
  setZoomValue: (zoom: number) => void;
};
export const SchemaZoomControl = ({
  onZoomChange,
  scale,
  setZoomValue,
  zoomValue,
}: PropsType) => {
  const zoomIn = () => {
    const zoom = Math.min(scale.value * 1.5, schemaMaxZoom);
    onZoomChange && onZoomChange(zoom, withTiming(zoom));
  };

  const zoomOut = () => {
    const zoom = Math.max(scale.value / 1.7, schemaMinZoom);
    onZoomChange && onZoomChange(zoom, withTiming(zoom));
  };
  return (
    <>
      <View style={styles.zoomBtns}>
        <TouchableOpacity onPress={zoomIn} style={styles.zoomBtn}>
          <FontAwesome5
            name="plus"
            style={{ color: COLORS.black, fontSize: 16 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={zoomOut} style={styles.zoomBtn}>
          <FontAwesome5
            name="minus"
            style={{ color: COLORS.black, fontSize: 16 }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.zoomSliderWrapper}>
        <Slider
          style={styles.zoomSlider}
          minimumValue={schemaMinZoom}
          maximumValue={schemaMaxZoom}
          step={0.01}
          value={zoomValue}
          onValueChange={(val) => {
            scale.value = val;
            setZoomValue(val);
          }}
          vertical
          minimumTrackTintColor="#ccc"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#fff"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  zoomSliderWrapper: {
    position: "absolute",
    right: 15,
    top: 123,
    height: 150,
    width: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  zoomSlider: {
    height: 10,
    width: 200,
    transform: [{ rotate: "-90deg" }], // ⬅️ делает слайдер вертикальным
  },
  zoomBtns: {
    position: "absolute",
    gap: 7,
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 15,
    height: 245,
    zIndex: 10,
    right: -2,
    top: 75,
  },
  zoomBtn: {
    padding: 3,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: COLORS.gray,
    backgroundColor: "#f5f5f5",
    width: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
