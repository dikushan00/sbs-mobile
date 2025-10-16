import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { apiUrl, COLORS, FONT, SIZES } from '@/constants';
import { ProjectCheckType, ProjectFiltersType, ProjectStagesChecksParamsType, ProjectStageType, SelectedDataType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { PhotoSlider } from '@/components/common/PhotoSlider';
import { getFloorMapChecks } from '@/components/main/services';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';

interface CommentsViewProps {
  selectedStage: ProjectStageType | null;
  onBack: () => void;
  filters: ProjectFiltersType;
  project_id: number | null;
  selectedData: SelectedDataType
}

export const CommentsView: React.FC<CommentsViewProps> = ({
  selectedStage,
  onBack, filters, project_id, selectedData
}) => {
  const dispatch = useDispatch();
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsData, setCommentsData] = useState<ProjectCheckType[] | null>(null);
  const [showPhotoSlider, setShowPhotoSlider] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    dispatch(setPageSettings({ backBtn: true, goBack: onBack }));
  }, [dispatch, onBack]);

  useEffect(() => {
    dispatch(setPageHeaderData({
      title: "Просмотр замечаний",
      desc: `Подъезд ${selectedData.entrance}, Блок ${selectedData.block_name}`,
    }));
  }, [dispatch, selectedData]);

  useEffect(() => {
    if (selectedStage) {
      const fetchComments = async () => {
        setCommentsLoading(true);
        const params: ProjectStagesChecksParamsType = {
          ...filters,
          project_id: project_id,
          work_set_check_group_id: selectedStage.work_set_check_group_id,
          placement_type_id: selectedStage.placement_type_id
        };
        const comments = await getFloorMapChecks(selectedStage.floor_map_id, params);
        setCommentsLoading(false);
        setCommentsData(comments || []);
      };
      fetchComments();
    }
  }, [selectedStage, filters, project_id]);

  const handleViewPhotos = (fileUrls: string[]) => {
    setCurrentPhotos(fileUrls);
    setCurrentPhotoIndex(0);
    setShowPhotoSlider(true);
  };

  const handleClosePhotoSlider = () => {
    setShowPhotoSlider(false);
    setCurrentPhotos([]);
    setCurrentPhotoIndex(0);
  };

  return (
    <View style={styles.container}>
      <View style={{padding: 16, paddingTop: 5, backgroundColor: '#fff'}}>
        <Text style={{fontSize: 16}}>
          {selectedStage?.work_set_check_group_name}
        </Text>
      </View>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {commentsLoading && <CustomLoader />}
        {!commentsLoading && commentsData?.length === 0 && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Замечаний не найдено</Text>
          </View>
        )}
        <View style={styles.accordionContainer}>
          {commentsData?.map((comment, index) => (
            <View key={comment.call_check_list_point_id || index} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentName}>{comment.check_name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: comment.is_accepted ? COLORS.green : COLORS.red }
                ]}>
                  <Text style={styles.statusText}>
                    {comment.is_accepted ? 'Принято' : 'Есть замечания'}
                  </Text>
                </View>
              </View>

              <View style={styles.commentInfo}>
                <ValueDisplay label='Информация:' value={comment.comments || 'Нет комментариев'} />
              </View>

              <View style={styles.commentInfo}>
                <ValueDisplay label='Мастер:' value={comment.call_employee_fio || 'Не указан'} />
              </View>

              {comment.file_urls && comment.file_urls.length > 0 && (
                <TouchableOpacity 
                  style={styles.viewPhotoButton}
                  onPress={() => handleViewPhotos(comment.file_urls)}
                >
                  <Text style={styles.viewPhotoText}>Просмотр фото ({comment.file_urls?.length})</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <PhotoSlider
        visible={showPhotoSlider}
        photos={currentPhotos}
        currentIndex={currentPhotoIndex}
        onClose={handleClosePhotoSlider}
        onIndexChange={setCurrentPhotoIndex}
        apiUrl={apiUrl} // TODO: Replace with actual API URL
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  accordionContainer: {
    marginTop: 20,
  },
  commentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  commentName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
  },
  commentInfo: {
    marginBottom: 10,
  },
  commentLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 2,
  },
  commentText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  viewPhotoButton: {
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  viewPhotoText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.primaryLight,
    textDecorationLine: 'underline',
  },
});
