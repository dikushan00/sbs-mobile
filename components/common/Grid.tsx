import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GridProps {
  data: any[];
  numColumns: number;
  spacing?: number;
  rowSpacing?: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  style?: ViewStyle;
}

export const Grid: React.FC<GridProps> = ({
  data,
  numColumns,
  spacing = 0,
  rowSpacing = 0,
  renderItem,
  style,
}) => {
  const rows = [];
  
  for (let i = 0; i < data.length; i += numColumns) {
    const rowItems = data.slice(i, i + numColumns);
    const isLastRow = i + numColumns >= data.length;
    
    rows.push(
      <View key={i} style={[
        styles.row, 
        { 
          gap: spacing,
          marginBottom: isLastRow ? 0 : rowSpacing 
        }
      ]}>
        {rowItems.map((item, index) => (
          <View key={i + index} style={[styles.item, { flex: 1 }]}>
            {renderItem(item, i + index)}
          </View>
        ))}
        {rowItems?.length < 2 && <View style={[styles.item, { flex: 1 }]}></View>}
      </View>
    );
  }

  return <View style={[styles.container, style]}>{rows}</View>;
};

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
  },
  item: {
  },
});
