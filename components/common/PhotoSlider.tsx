import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Image, ScrollView, BackHandler, ActivityIndicator } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';

interface PhotoSliderProps {
  visible: boolean;
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  apiUrl: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const PhotoSlider: React.FC<PhotoSliderProps> = ({
  visible,
  photos,
  currentIndex,
  onClose,
  onIndexChange,
  apiUrl
}) => {
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  // Handle Android back button and reset failed images
  useEffect(() => {
    if (visible) {
      // Reset failed images when opening slider
      setFailedImages(new Set());
      setLoadingImages(new Set());
      
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true; // Prevent default behavior
      });

      return () => backHandler.remove();
    }
  }, [visible, onClose]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const getFullImageUrl = (photoPath: string) => {
    return `${apiUrl}${photoPath}`;
  };

  const handleImageLoadStart = (index: number) => {
    setLoadingImages(prev => new Set(prev).add(index));
  };

  const handleImageLoadEnd = (index: number) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageError = (index: number) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setFailedImages(prev => new Set(prev).add(index));
  };

  if (!visible || photos.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.closeArea} 
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.header}>
          <Text style={styles.counter}>
            {currentIndex + 1} / {photos.length}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" width={24} height={24} stroke={COLORS.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              onIndexChange(index);
            }}
            style={styles.scrollView}
            contentOffset={{ x: currentIndex * screenWidth, y: 0 }}
          >
            {photos.map((photo, index) => (
              <View key={index} style={styles.imageWrapper}>
                {failedImages.has(index) ? (
                  <View style={styles.placeholderContainer}>
                    <Image
                      source={require('@/assets/images/placeholder.png')}
                      style={styles.placeholderImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.placeholderText}>Фото недоступно</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: getFullImageUrl(photo) }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoadStart={() => handleImageLoadStart(index)}
                    onLoadEnd={() => handleImageLoadEnd(index)}
                    onError={() => handleImageError(index)}
                  />
                )}
                {loadingImages.has(index) && (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Загрузка...</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {photos.length > 1 && (
          <View style={styles.navigation}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              disabled={currentIndex === 0}
            >
              <Icon name="arrowRight" width={30} height={30} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.navButton, currentIndex === photos.length - 1 && styles.navButtonDisabled]}
              disabled={currentIndex === photos.length - 1}
            >
              <Icon name="arrowRight" width={30} height={30}  />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  closeButton: {
    padding: 10,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255, .5)',
  },
  counter: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
  },
  imageContainer: {
    flex: 1,
    width: screenWidth,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageWrapper: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  navigation: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    transform: [{ translateY: -20 }],
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '50%',
    padding: 15,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loaderText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    marginTop: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%'
  },
  placeholderImage: {
    width: 200,
    height: 200,
  },
  placeholderText: {
    color: COLORS.gray,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    marginTop: 15,
    textAlign: 'center',
  },
});
