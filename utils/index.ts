import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Alert, Linking, Platform } from "react-native";
import { apiUrl, FILE_URL_MAIN } from "../constants";

export const getFullUrl = (url = "", api = false) => {
  try {
    return `${api ? apiUrl : FILE_URL_MAIN}${url}`;
  } catch (e) {}
};

const saveOnAndroidDevice = async (
  uri: string,
  directoryUri: string,
  fileName: string,
  mimeType: string
) => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return await FileSystem.StorageAccessFramework.createFileAsync(
    directoryUri,
    fileName,
    mimeType
  )
    .then(async (uri) => {
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return true;
    })
    .catch(() => {});
};

const saveOnIosDevice = async (uri: string) => {
  try {
    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.createAlbumAsync("Smart Build System", asset, false);
    return true;
  } catch (e) {}
};
export const saveFile = async (
  uri: string,
  fileName: string,
  mimeType: string,
  files?: { uri: string; fileName: string; mimeType: string }[]
) => {
  if (Platform.OS === "android") {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      if (files?.length) {
        const res = await Promise.all(
          files.map(
            async (item) =>
              await saveOnAndroidDevice(
                item.uri,
                permissions.directoryUri,
                item.fileName,
                item.mimeType
              )
          )
        );
        return res?.every((item) => !!item);
      } else {
        return await saveOnAndroidDevice(
          uri,
          permissions.directoryUri,
          fileName,
          mimeType
        );
      }
    } else {
      await Sharing.shareAsync(uri);
    }
  } else if (Platform.OS === "ios") {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    const hasPermission = status === "granted";
    if (!hasPermission) {
      Alert.alert("Ошибка", "Нет разрешения на доступ к галерее");
      return;
    }
    if (files?.length) {
      const res = await Promise.all(
        files.map(async (item) => await saveOnIosDevice(item.uri))
      );
      return res?.every((item) => !!item);
    } else {
      return await saveOnIosDevice(uri);
    }
  } else {
    await Sharing.shareAsync(uri);
  }
};

export const getFileInfo = async (fileName: string) => {
  try {
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo;
  } catch (e) {}
};

export const openFile = async (fileName: string) => {
  try {
    const fileInfo = await getFileInfo(fileName);
    if (fileInfo?.exists) {
      const cUri = await FileSystem.getContentUriAsync(fileInfo.uri);
      if (Platform.OS === "ios") return Sharing.shareAsync(cUri);
      IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: cUri,
        flags: 1,
        type: "application/pdf",
      });
    }
  } catch (error) {}
};

export const openLinkInBrowser = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error("Cannot open URL:", url);
    }
  } catch (error) {
    console.error("Error opening URL:", error);
  }
};
export const numberWithCommas = (
  x: string | number | undefined | null,
  noDataText: string = ""
): string => {
  try {
    if (x === undefined || x === null) return noDataText || "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  } catch (e) {
    return "";
  }
};
export const cutString = (str = "", length = 30) => {
  try {
    if (str?.length <= length) return str;
    return `${str.slice(0, length)}..`;
  } catch (e) {}
};

export const generateRandomString = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

export const sortByLength = (tabs: any[]) => {
  return tabs?.sort((a, b) => {
    if (a.length === 0 && b.length !== 0) return 1;
    if (a.length !== 0 && b.length === 0) return -1;
    return 0;
  });
};

export const getMediaTypeByExtension = (url = "") => {
  const cleanedUrl = url.split("?")[0].split("#")[0];
  const extension = cleanedUrl.split(".").pop()?.toLowerCase();

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "mov",
    "avi",
    "wmv",
    "flv",
    "mkv",
  ];

  if (!extension) return "unknown";

  if (imageExtensions.includes(extension)) {
    return "image";
  } else if (videoExtensions.includes(extension)) {
    return "video";
  } else {
    return "unknown";
  }
};
