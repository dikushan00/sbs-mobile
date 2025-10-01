import { PAGE_NAMES } from "@/constants";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { RemontInfo } from "./RemontInfo";
import { RemontType } from "./types";

export const RemontItem = ({ data }: { data: RemontType }) => {
  const navigation = useNavigation();

  const handleClickDetail = () => {
    navigation.navigate(
      //@ts-ignore
      PAGE_NAMES.remontDetail as never,
      { remont_id: data.remont_id } as never
    );
  };

  return (
    <TouchableOpacity onPress={handleClickDetail}>
      <RemontInfo data={data} title={data.address} icon="building" />
    </TouchableOpacity>
  );
};
