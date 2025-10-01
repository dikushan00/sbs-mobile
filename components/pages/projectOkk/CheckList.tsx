import { COLORS } from "@/constants";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { CheckListType } from "./services";
import { useSnackbar } from "@/components/snackbar/SnackbarContext";

type PropsType = {
  onClick: (n: number) => void;
  activeCheckListId: number | null;
  isEditable?: boolean;
  showAllPointsMode?: boolean;
  setShowAllPointsMode?: (n: boolean) => void;
  data: CheckListType;
  onCheckStatusChange: (n: number, status: "1" | "0") => void;
  uploadFilesToCheckList: () => void;
  pointsData: { count: number; filesCount: number; checkedPointsCount: number };
  activePoint: { x: number; y: number } | null;
};

export const CheckList = ({
  onClick,
  activeCheckListId,
  data,
  isEditable,
  showAllPointsMode,
  setShowAllPointsMode,
  onCheckStatusChange,
  uploadFilesToCheckList,
  pointsData,
  activePoint,
}: PropsType) => {
  const { showErrorSnackbar } = useSnackbar();

  const getBorderColor = () => {
    return COLORS.gray;
  };

  const getTextColor = () => {
    if (data?.check_list_is_accepted === "1") return COLORS.success;
    if (pointsData?.count > 0) return COLORS.error;
    return "404040";
  };

  const onChange = () => {
    if (!isEditable) return;
    if (activeCheckListId !== data.check_list_id) onClick(data.check_list_id);

    if (
      data.check_list_is_accepted !== "1" &&
      pointsData?.count !== pointsData?.checkedPointsCount
    )
      return showErrorSnackbar(
        "Чек-лист не может быть принят, так как имеются замечания"
      );

    if (data.check_list_is_accepted === "1" && !pointsData?.count)
      return onCheckStatusChange(data.check_list_id, "0");

    onCheckStatusChange(data.check_list_id, "1");
  };

  const isActive = activeCheckListId === data.check_list_id;
  const isAccepted = data.check_list_is_accepted === "1";

  return (
    <Pressable
      onPress={() => onClick && onClick(data.check_list_id)}
      style={({ pressed }) => [
        {
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderColor: isActive ? COLORS.primary : getBorderColor(),
          backgroundColor: isActive ? COLORS.primaryBackground : "#fff",
          borderWidth: isActive ? 3 : 2,
          borderRadius: 8,
          shadowColor: isActive ? COLORS.primary : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isActive ? 0.4 : 0.2,
          shadowRadius: isActive ? 6 : 4,
          elevation: isActive ? 8 : 4,
          transform: pressed ? [{ scale: 0.98 }] : [],
          opacity: pressed ? 0.95 : 1,
          flexDirection: "row", // общий контейнер с камерой и контентом
          alignItems: "stretch", // чтобы дочерние View тянулись по высоте
        },
      ]}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <TouchableOpacity
            disabled={!isEditable}
            onPress={onChange}
            style={{ marginRight: 8 }}
          >
            <FontAwesome5
              name={isAccepted ? "check-square" : "square"}
              size={18}
              color={isAccepted ? "green" : "#999"}
            />
          </TouchableOpacity>
          <Text
            style={{
              flexShrink: 1,
              fontWeight: "700",
              color: getTextColor(),
              width: "75%",
            }}
          >
            {data.check_name}
            {data.is_required ? "*" : ""}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 5,
            gap: 15,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <FontAwesome5 name="exclamation-circle" size={12} color="#999" />
            <Text style={{ fontSize: 12, color: "#999" }}>
              {pointsData.count}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <FontAwesome5 name="check" size={12} color="#999" />
            <Text style={{ fontSize: 12, color: "#999" }}>
              {pointsData.checkedPointsCount}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <FontAwesome5 name="paperclip" size={12} color="#999" />
            <Text style={{ fontSize: 12, color: "#999" }}>
              {pointsData.filesCount}
            </Text>
          </View>
        </View>
      </View>
      {isActive && isEditable !== false && (
        <TouchableOpacity
          style={{
            borderLeftWidth: 1,
            borderColor: showAllPointsMode ? COLORS.info : COLORS.primary,
            paddingHorizontal: 12,
            justifyContent: "center",
          }}
          onPress={() =>
            setShowAllPointsMode && setShowAllPointsMode(!showAllPointsMode)
          }
        >
          <FontAwesome5
            name={showAllPointsMode ? "list" : "tasks"}
            color={showAllPointsMode ? COLORS.info : COLORS.primary}
            style={{ fontSize: 24 }}
          />
        </TouchableOpacity>
      )}

      {activePoint && isActive && isEditable !== false && (
        <TouchableOpacity
          style={{
            borderLeftWidth: 1,
            borderColor: COLORS.primary,
            paddingHorizontal: 12,
            justifyContent: "center",
          }}
          onPress={uploadFilesToCheckList}
        >
          <FontAwesome5
            name="camera"
            color={COLORS.primary}
            style={{ fontSize: 24 }}
          />
        </TouchableOpacity>
      )}
    </Pressable>
  );
};
