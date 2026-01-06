import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, RefreshControl, Modal, Linking, Switch } from "react-native";
import { Icon } from "@/components/Icon";
import { useDispatch, useSelector } from "react-redux";
import { logout, userAppState, getUserInfo, changeUserType } from "@/services/redux/reducers/userApp";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { AppDispatch } from "@/services/redux";
import { COLORS, STORAGE_KEYS } from "@/constants";
import { NavigationLayout } from "@/components/layout/NavigationLayout";
import { chooseCity, deleteAccount, deletePushToken, addPushToken, registerForPushNotificationsAsync } from "@/services";
import { BOTTOM_DRAWER_KEYS } from "@/components/BottomDrawer/constants";
import { UserTypeValue } from "@/services/redux/types";
import { storageService } from "@/services/storage";
import * as Notifications from "expo-notifications";

// TextField component for profile information
const TextField = ({ 
  label, 
  value, 
  onPress, 
  showArrow = false 
}: { 
  label: string; 
  value: string; 
  onPress?: () => void; 
  showArrow?: boolean;
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container style={styles.textField} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.textFieldContent}>
        <Text style={styles.textFieldLabel}>{label}</Text>
        <Text style={styles.textFieldValue}>{value || 'Не указано'}</Text>
      </View>
      {showArrow && (
        <View style={styles.arrowContainer}>
          <Icon name="arrowRight" width={18} height={18} stroke={COLORS.gray} />
        </View>
      )}
    </Container>
  );
};

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { logoutLoading, userData, userDataFetching, userType } = useSelector(userAppState);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  // Load notifications preference on mount
  useEffect(() => {
    const loadNotificationsPreference = async () => {
      try {
        const stored = await storageService.getData(STORAGE_KEYS.notificationsEnabled);
        if (stored?.enabled !== undefined) {
          setNotificationsEnabled(stored.enabled);
        }
      } catch (e) {}
    };
    loadNotificationsPreference();
  }, []);

  const handleNotificationsToggle = async (value: boolean) => {
    if (isTogglingNotifications) return;
    
    setIsTogglingNotifications(true);
    try {
      const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
      
      if (!value) {
        // Disabling notifications - delete token from server
        await deletePushToken(pushToken);
        setNotificationsEnabled(false);
        await storageService.setData(STORAGE_KEYS.notificationsEnabled, { enabled: false });
      } else {
        // Enabling notifications - request permission and send token to server
        const permissionGranted = await registerForPushNotificationsAsync();
        if (permissionGranted) {
          const newToken = (await Notifications.getExpoPushTokenAsync()).data;
          await addPushToken(newToken);
          setNotificationsEnabled(true);
          await storageService.setData(STORAGE_KEYS.notificationsEnabled, { enabled: true });
        }
      }
    } catch (e) {
      console.error('Error toggling notifications:', e);
    } finally {
      setIsTogglingNotifications(false);
    }
  };

  const onRefresh = () => {
    dispatch(getUserInfo());
  };

  const handleUserTypeChange = (type: UserTypeValue) => {
    dispatch(changeUserType(type));
  };

  const handleCityPress = () => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.citySelect,
      data: {
        currentCityId: userData?.city_id,
        onSelect: handleCitySelect,
      }
    }));
  };

  const handleCitySelect = async (cityId: number) => {
    const success = await chooseCity(cityId);
    if (success) {
      dispatch(getUserInfo());
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    if (logoutLoading) return;
    setShowLogoutModal(false);
    dispatch(logout());
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Удаление аккаунта",
      "Вы уверены, что хотите деактивировать свой аккаунт? Это действие можно будет отменить.",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const success = await deleteAccount();
              if (success) {
                setShowDeleteModal(true);
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    dispatch(logout());
  };

  const handleOpenFAQ = () => {
    handleCloseModal();
    Linking.openURL("https://smartremont.kz/faq");
  };

  // Get first and last name from fio
  const getNameParts = () => {
    if (!userData?.fio) return { firstName: '', lastName: '' };
    const parts = userData.fio.split(' ');
    return {
      lastName: parts[0] || '',
      firstName: parts[1] || '',
    };
  };

  const { firstName, lastName } = getNameParts();

  return (
    <NavigationLayout>
      <>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={userDataFetching}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Profile Fields */}
          <View style={styles.fieldsContainer}>
            <TextField 
              label="Имя" 
              value={firstName}
            />
            <TextField 
              label="Фамилия" 
              value={lastName}
            />
            <TextField 
              label="Должность" 
              value={userData?.position_name || ''}
            />
            <TextField 
              label="Компания" 
              value={userData?.company_name || ''}
            />
            <TextField 
              label="Город" 
              value={userData?.city_name || ''}
              onPress={handleCityPress}
              showArrow
            />
            <TextField 
              label="ID сотрудника" 
              value={userData?.employee_id?.toString() || ''}
            />
          </View>

          {/* Notifications Toggle */}
          <View style={styles.notificationRow}>
            <Text style={styles.notificationText}>Разрешить уведомления</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              disabled={isTogglingNotifications}
              trackColor={{ false: '#E5E5E5', true: COLORS.primary }}
              thumbColor={COLORS.white}
              ios_backgroundColor="#E5E5E5"
            />
          </View>

          {/* User Type Selection for ECP */}
          {__DEV__ && <View style={styles.userTypeSection}>
            <Text style={styles.sectionTitle}>Тип пользователя для ЭЦП</Text>
            <Text style={styles.sectionDesc}>Выберите тип для подписания документов через eGov mobile</Text>
            
            <View style={styles.userTypeButtons}>
              <TouchableOpacity 
                style={[
                  styles.userTypeButton, 
                  userType === 'individual' && styles.userTypeButtonActive
                ]}
                onPress={() => handleUserTypeChange('individual')}
                activeOpacity={0.7}
              >
                <Icon 
                  name="user" 
                  width={20} 
                  height={20} 
                  fill={userType === 'individual' ? COLORS.white : COLORS.primary} 
                />
                <Text style={[
                  styles.userTypeButtonText,
                  userType === 'individual' && styles.userTypeButtonTextActive
                ]}>Физ. лицо</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.userTypeButton, 
                  userType === 'business' && styles.userTypeButtonActive
                ]}
                onPress={() => handleUserTypeChange('business')}
                activeOpacity={0.7}
              >
                <Icon 
                  name="work" 
                  width={20} 
                  height={20} 
                  fill={userType === 'business' ? COLORS.white : COLORS.primary} 
                />
                <Text style={[
                  styles.userTypeButtonText,
                  userType === 'business' && styles.userTypeButtonTextActive
                ]}>Юр. лицо</Text>
              </TouchableOpacity>
            </View>
          </View>}

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutButtonText}>Выйти</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            <Icon name="trashLine" width={18} height={18} fill="#C50F1F" />
            <Text style={styles.deleteButtonText}>
              {isDeleting ? "Удаление..." : "Удалить аккаунт"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelLogout}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.logoutModalContent}>
              <View style={styles.logoutIconContainer}>
                <Icon name="logout" width={32} height={32} stroke={COLORS.primary} />
              </View>
              
              <Text style={styles.logoutModalTitle}>Выход из аккаунта</Text>
              
              <Text style={styles.logoutModalDescription}>
                Вы уверены, что хотите выйти из приложения?
              </Text>

              <View style={styles.logoutModalButtons}>
                <TouchableOpacity 
                  style={styles.logoutCancelButton} 
                  onPress={cancelLogout}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logoutCancelButtonText}>Отмена</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.logoutConfirmButton} 
                  onPress={confirmLogout}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logoutConfirmButtonText}>Выйти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Success Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Icon name="checkCircle" width={60} height={60} fill={COLORS.primary} />
              </View>
              
              <Text style={styles.modalTitle}>Аккаунт успешно деактивирован</Text>
              
              <Text style={styles.modalDescription}>
                Чтобы полностью удалить данные о вашем аккаунте, необходимо перейти по ссылке и заполнить форму:
              </Text>

              <TouchableOpacity style={styles.linkButton} onPress={handleOpenFAQ}>
                <Text style={styles.linkButtonText}>Перейти</Text>
                <Icon name="arrowRightAlt" width={16} height={16} fill={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
                <Text style={styles.modalCloseButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 30,
  },
  
  // Text Fields
  fieldsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  textField: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textFieldContent: {
    flex: 1,
    gap: 2,
  },
  textFieldLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  textFieldValue: {
    fontSize: 14,
    color: '#1F1F1F',
    lineHeight: 16,
  },
  arrowContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Notifications Toggle
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 24,
  },
  notificationText: {
    fontSize: 16,
    color: '#1F1F1F',
  },

  // User Type Section
  userTypeSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  userTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  userTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  userTypeButtonTextActive: {
    color: COLORS.white,
  },

  // Logout Button
  logoutButton: {
    backgroundColor: '#D0DAE7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#152957',
  },

  // Delete Button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C50F1F',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Logout Modal Styles
  logoutModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  logoutModalDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelButton: {
    flex: 1,
    backgroundColor: '#F2F5F8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
