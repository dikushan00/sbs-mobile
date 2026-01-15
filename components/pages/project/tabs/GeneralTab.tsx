import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants';
import { ProjectInfoResponseType } from '@/components/main/types';
import { useDispatch } from 'react-redux';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { setPageSettings } from '@/services/redux/reducers/app';
import { 
  AssignedPersons, 
  FinancialInfo, 
  OrderedMaterials 
} from '../blocks';
import { BlockItem } from '@/components/common/BlockItem';

interface GeneralTabProps {
  projectInfo: ProjectInfoResponseType | null;
  onBackToProject?: () => void;
}

export const GeneralTab = ({projectInfo, onBackToProject}: GeneralTabProps) => {
  const dispatch = useDispatch();
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const handleBlockPress = (block: any) => {
    setSelectedBlock(block.id);
    dispatch(setUserPageHeaderData({
      title: block.title,
      desc: "",
    }));
  };

  const renderBlockContent = () => {
    switch (String(selectedBlock)) {
      case '1':{
        return <AssignedPersons data={projectInfo?.employees || []} />;
      }
      case '2':
        return <FinancialInfo data={projectInfo?.sums || []} />;
      case '3':
        return <OrderedMaterials data={projectInfo?.materials || []} />;
      default:
        return null;
    }
  };

  const handleBackToGeneral = () => {
    setSelectedBlock(null);
    dispatch(setUserPageHeaderData({
      title: "Общее",
      desc: "",
    }));
  };

  const handleBackToProject = () => {
    setSelectedBlock(null);
    if (onBackToProject) {
      onBackToProject();
    }
  };

  useEffect(() => {
    if (selectedBlock) {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: handleBackToGeneral
      }));
    } else {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: handleBackToProject
      }));
    }
  }, [selectedBlock]);

  if (selectedBlock) {
    return renderBlockContent();
  }

  return (
    <View style={styles.container}>
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          title={block.title}
          icon={block.icon} iconColor={COLORS.primaryLight}
          onPress={() => handleBlockPress(block)}
        />
      ))}
    </View>
  );
};

const blocks = [
  {
    id: 1,
    title: 'Назначенные лица',
    icon: 'people',
  },
  {
    id: 2,
    title: 'Финансовая информация',
    icon: 'money',
  },
  {
    id: 3,
    title: 'Объем материалов',
    icon: 'materials',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
    gap: 5,
  },
});
