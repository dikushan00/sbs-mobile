import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants";
import { FloorCheckPointInfo, FloorCheckPoint } from "@/components/main/types";
import { CustomButton } from "../../common/CustomButton";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { FileList } from "@/components/FileList";
import { getFullUrl } from "@/utils";
import { getFloorMapPointInfo } from "@/components/main/services";
import { CustomLoader } from "../../common/CustomLoader";

interface PointInfoProps {
  data: {
    floor_map_id: number;
    point: FloorCheckPoint;
  };
  handleClose: () => void;
}

export const PointInfo: React.FC<PointInfoProps> = ({ data, handleClose }) => {
  const [pointInfo, setPointInfo] = useState<FloorCheckPointInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPointInfo = async () => {
      try {
        setLoading(true);
        setError(false);
        const info = await getFloorMapPointInfo(
          data.floor_map_id,
          data.point.call_check_list_point_id
        );
        
        if (info) {
          setPointInfo(info);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching point info:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPointInfo();
  }, [data.floor_map_id, data.point.call_check_list_point_id]);

  const getStatusText = (isAccepted: boolean | null) => {
    if (isAccepted === null) return "На проверке";
    if (isAccepted === true) return "Принято";
    if (isAccepted === false) return "Отклонено";
    return "На проверке";
  };

  const getStatusColor = (isAccepted: boolean | null) => {
    if (isAccepted === null) return COLORS.primary;
    if (isAccepted === true) return "#006600";
    if (isAccepted === false) return "red";
    return COLORS.gray;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <BottomDrawerHeader title="Информация о замечании" handleClose={handleClose} />
        <View style={styles.loadingContainer}>
          <CustomLoader />
          <Text style={styles.loadingText}>Загрузка информации...</Text>
        </View>
      </View>
    );
  }

  if (error || !pointInfo) {
    return (
      <View style={styles.container}>
        <BottomDrawerHeader title="Информация о замечании" handleClose={handleClose} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Информация о замечании не найдена</Text>
          <CustomButton
            title="Закрыть"
            onClick={handleClose}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BottomDrawerHeader title="Информация о замечании" handleClose={handleClose} />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{pointInfo.check_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pointInfo.is_accepted) }]}>
            <Text style={styles.statusText}>{getStatusText(pointInfo.is_accepted)}</Text>
        </View>
        {pointInfo.comments && (
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Комментарии:</Text>
            <Text style={styles.commentsText}>{pointInfo.comments}</Text>
          </View>
        )}

        {pointInfo.file_urls && pointInfo.file_urls.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={styles.filesTitle}>Прикрепленные файлы:</Text>
            
            <FileList
              files={pointInfo.file_urls?.map(item => ({uri: `${getFullUrl(item)}`, name: '', type: ''})) || []}
              galleryMode
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16
  },
  contentContainer: {
    paddingRight: 7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
    marginRight: 10,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  commentsSection: {
    marginTop: 20
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  commentsText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  filesSection: {
    marginBottom: 20,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 20
  },
  fileUrl: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 4,
  },
  actions: {
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
  },
});
