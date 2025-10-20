import { COLORS } from "@/constants"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"

export const Block = ({ children, onPress }: { children: React.ReactNode, onPress?: () => void }) => { 
  if(onPress)
    return <TouchableOpacity style={styles.block} onPress={onPress}>
      {children}
    </TouchableOpacity>
    
  return <View style={styles.block}>
    {children}
  </View>
 }  

export const BlockContainer = ({ children }: { children: React.ReactNode }) => { 
 return <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>{children}</ScrollView>
} 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.background,
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
    gap: 12,
  },
})