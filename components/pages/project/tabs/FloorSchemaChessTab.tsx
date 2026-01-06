import React, { useEffect } from 'react';
import { SelectedDataType } from '@/components/main/types';
import { FloorSchemaChess } from './FloorSchemaChess';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';

interface FloorSchemaChessTabProps {
  onBack?: () => void;
  selectedData: SelectedDataType;
}

export const FloorSchemaChessTab = ({ onBack, selectedData }: FloorSchemaChessTabProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
  }, [dispatch, onBack]);

  return <FloorSchemaChess onBack={onBack} selectedData={selectedData} />;
};

