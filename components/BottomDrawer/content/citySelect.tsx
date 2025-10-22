import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CitySelectDrawerType } from "../types";
import { COLORS } from "@/constants";
import { Icon } from "@/components/Icon";
import { BottomDrawerHeader } from "../BottomDrawerHeader";
import { CityType } from "@/services/types";
import { getCities } from "@/services";

interface CitySelectProps {
  data: CitySelectDrawerType;
  handleClose: () => void;
}

export const CitySelect: React.FC<CitySelectProps> = ({ data, handleClose }) => {
  const { currentCityId, onSelect } = data;
  const [cities, setCities] = useState<CityType[]>([]);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const citiesData = await getCities();
      if (citiesData) {
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleCitySelect = (cityId: number) => {
    onSelect(cityId);
    handleClose();
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader title="Выберите город" handleClose={handleClose} />
      
      <View style={styles.citiesList}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city.city_id}
            style={[
              styles.cityItem,
              currentCityId === city.city_id && styles.selectedCityItem
            ]}
            onPress={() => handleCitySelect(city.city_id)}
          >
            <Text style={[
              styles.cityName,
              currentCityId === city.city_id && styles.selectedCityName
            ]}>
              {city.city_name}
            </Text>
            {currentCityId === city.city_id && (
              <Icon name="check" width={20} height={20} fill={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 30
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  citiesList: {
    flex: 1,
    paddingTop: 10
  },
  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  selectedCityItem: {
    backgroundColor: "#e3f2fd",
    borderColor: COLORS.primary,
  },
  cityName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedCityName: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
