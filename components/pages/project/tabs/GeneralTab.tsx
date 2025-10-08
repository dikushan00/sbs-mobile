import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { ProjectInfoResponseType } from '@/components/main/types';
import { useDispatch } from 'react-redux';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { setPageSettings } from '@/services/redux/reducers/app';
import { 
  AssignedPersons, 
  Contracts, 
  FinancialInfo, 
  OrderedMaterials 
} from '../blocks';

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
    switch (selectedBlock) {
      case '1':
        return <AssignedPersons />;
      case '2':
        return <Contracts />;
      case '3':
        return <FinancialInfo />;
      case '4':
        return <OrderedMaterials />;
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
        <TouchableOpacity
          key={block.id}
          style={styles.block}
          onPress={() => handleBlockPress(block)}
        >
          <View style={styles.blockContent}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <Icon name={block.icon as any} width={16} height={16} fill={COLORS.primary} />
              </View>
              <Text style={styles.blockTitle}>{block.title}</Text>
            </View>
            <Icon name="arrowRightAlt" width={16} height={16} fill={COLORS.gray} />
          </View>
        </TouchableOpacity>
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
    title: 'Договора',
    icon: 'document',
  },
  {
    id: 3,
    title: 'Финансовая информация',
    icon: 'money',
  },
  {
    id: 4,
    title: 'Заказанный объем материалов',
    icon: 'materials',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.backgroundWhite,
    gap: 12,
  },
  block: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  blockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#DFEFFF',
    borderRadius: 6,
    padding: 7,
    marginRight: 15,
  },
  blockTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
  },
});
