import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants';
import { ProjectFiltersType, SelectedDataType } from '@/components/main/types';
import { FloorSchemaContent } from './FloorSchemaContent';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';

export const FloorSchemaTab = ({onBack, selectedData}: {onBack?: () => void, selectedData: SelectedDataType}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
  }, []);

  return <FloorSchemaContent onBack={onBack} selectedData={selectedData} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
    gap: 5,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
