import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ScrollView, RefreshControl, Modal, Linking } from "react-native";
import { Icon } from "@/components/Icon";
import { useDispatch, useSelector } from "react-redux";
import { logout, userAppState, getUserInfo } from "@/services/redux/reducers/userApp";
import { showBottomDrawer } from "@/services/redux/reducers/app";
import { AppDispatch } from "@/services/redux";
import { COLORS } from "@/constants";
import { NavigationLayout } from "@/components/layout/NavigationLayout";
import { chooseCity, deleteAccount } from "@/services";
import { BOTTOM_DRAWER_KEYS } from "@/components/BottomDrawer/constants";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { logoutLoading, userData, userDataFetching } = useSelector(userAppState);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = () => {
    dispatch(getUserInfo());
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
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти из приложения?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Выйти",
          style: "destructive",
          onPress: () => {
            if (logoutLoading) return;
            dispatch(logout());
          },
        },
      ]
    );
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
    handleCloseModal()
    Linking.openURL("https://smartremont.kz/faq");
  };

  return (
    <NavigationLayout>
      <>
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={userDataFetching}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {userData?.image_url ? (
                <Image source={{ uri: userData.image_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {userData?.fio ? userData.fio.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData?.fio || 'Не указано'}</Text>
              <Text style={styles.userPosition}>{userData?.position_name || 'Не указано'}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Icon name="work" width={20} height={20} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Компания</Text>
                <Text style={styles.detailValue}>{userData?.company_name || 'Не указано'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.detailItem} onPress={handleCityPress}>
              <Icon name="map" width={20} height={20} fill={COLORS.primaryLight} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Город</Text>
                <Text style={styles.detailValue}>{userData?.city_name || 'Не указано'}</Text>
              </View>
              <Icon name="arrowRight" width={16} height={16} />
            </TouchableOpacity>

            <View style={styles.detailItem}>
              <Icon name="people" width={20} height={20} fill={COLORS.primaryLight} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{userData?.email || 'Не указано'}</Text>
              </View>
            </View>
            <View style={{...styles.detailItem, borderBottomWidth: 0}}>
              <Icon name="info" width={20} height={20} fill={COLORS.primaryLight} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ID сотрудника</Text>
                <Text style={styles.detailValue}>{userData?.employee_id || 'Не указано'}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" width={20} height={20} />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          <Icon name="trashLine" width={20} height={20} fill={COLORS.red} />
          <Text style={styles.deleteText}>
            {isDeleting ? "Удаление..." : "Удалить аккаунт"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginBottom: 20,
    color: "#333",
    textAlign: "center"
  },
  
  profileHeader: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  userPosition: {
    fontSize: 16,
    color: "#666",
  },

  detailsSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
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
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginRight: 8,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

