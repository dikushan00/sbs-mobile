import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { Icon } from "@/components/Icon";
import { useDispatch, useSelector } from "react-redux";
import { logout, userAppState } from "@/services/redux/reducers/userApp";
import { AppDispatch } from "@/services/redux";
import { COLORS } from "@/constants";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { logoutLoading, userData } = useSelector(userAppState);

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

  return (
    <ScrollView style={styles.container}>
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

          <View style={styles.detailItem}>
            <Icon name="map" width={20} height={20} fill={COLORS.primaryLight} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Город</Text>
              <Text style={styles.detailValue}>{userData?.city_name || 'Не указано'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="people" width={20} height={20} fill={COLORS.primaryLight} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{userData?.email || 'Не указано'}</Text>
            </View>
          </View>

          {userData?.group_names && (
            <View style={styles.detailItem}>
              <Icon name="flag" width={20} height={20} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Роли</Text>
                <Text style={styles.detailValue}>{userData.group_names}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
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
    </ScrollView>
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
    width: 80,
    height: 80,
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
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  userPosition: {
    fontSize: 16,
    color: "#666",
  },

  detailsSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
});

