import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { Alert, Linking, Platform } from "react-native";
import { apiUrl, FILE_URL_MAIN } from "../constants";
import { Directory, Paths, File } from "expo-file-system";

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

export const downloadFile = async (response: any, fileName: string) => {
  if (!response) {
    Alert.alert('Ошибка', 'Не удалось получить документ');
    return;
  }
  try {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // const response = arrayBufferToBase64(res)

    // Обрабатываем разные типы ответов от API
    let pdfData;
    if (typeof response === 'string') {
      // Если ответ уже строка (base64)
      pdfData = response;
    } else if (response.data) {
      // Если ответ содержит поле data
      if (response.data instanceof ArrayBuffer) {
        // Конвертируем ArrayBuffer в base64
        const uint8Array = new Uint8Array(response.data);
        const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
        pdfData = btoa(binaryString);
      } else {
        pdfData = response.data;
      }
    } else if (response.file || response.content) {
      // Если ответ содержит file или content
      pdfData = response.file || response.content;
    } else {
      // Пробуем конвертировать в base64
      pdfData = btoa(JSON.stringify(response));
    }

    // Сохраняем файл
    await FileSystem.writeAsStringAsync(fileUri, pdfData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Проверяем, доступно ли sharing
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      saveFile(fileUri, fileName, 'application/pdf')
    } else {
      Alert.alert('Успех', 'Документ сохранен в папку приложения');
    }
  } catch (error) {
    console.error(error)
  }
}

const sanitizeFileName = (fileName: string) => {
  try {
    // Android/iOS file systems are generally fine, but we still remove clearly unsafe chars.
    return fileName.replace(/[\\/:*?"<>|]+/g, "_").trim();
  } catch (e) {
    return fileName;
  }
};

const getMimeTypeByFileName = (fileName: string) => {
  const lower = (fileName || "").toLowerCase();
  const ext = lower.split("?")[0].split("#")[0].split(".").pop();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "txt":
      return "text/plain";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "*/*";
  }
};

const extractBase64FromApiResponse = (response: any) => {
  // Обрабатываем разные типы ответов от API
  if (typeof response === "string") return response;

  if (response?.data) {
    if (response.data instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(response.data);
      const binaryString = Array.from(uint8Array, (byte) =>
        String.fromCharCode(byte)
      ).join("");
      return btoa(binaryString);
    }
    return response.data;
  }

  if (response?.file || response?.content) {
    return response.file || response.content;
  }

  return btoa(JSON.stringify(response));
};

export const getLocalFileUri = (fileName: string) => {
  const safeName = sanitizeFileName(fileName);
  const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  return `${baseDir}${safeName}`;
};

export const openFileUri = async (uri: string, mimeType?: string) => {
  try {
    if (!uri) return;
    const type = mimeType || "*/*";

    if (Platform.OS === "android") {
      const cUri = await FileSystem.getContentUriAsync(uri);
      return await IntentLauncher.startActivityAsync(
        "android.intent.action.VIEW",
        {
          data: cUri,
          flags: 1,
          type,
        }
      );
    }

    // iOS/web: try direct open first (QuickLook/preview), fallback to Sharing
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        return await Linking.openURL(uri);
      }
    } catch (e) {}

    return await Sharing.shareAsync(uri);
  } catch (e) {}
};

export const openLocalFileIfExists = async (fileName: string) => {
  try {
    const uri = getLocalFileUri(fileName);
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && (info.size ?? 0) > 0) {
      const mimeType = getMimeTypeByFileName(fileName);
      await openFileUri(uri, mimeType);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

// Скачивает (из axios arraybuffer/base64 ответа), сохраняет локально и сразу открывает
export const downloadAndOpenFile = async (response: any, fileName: string) => {
  if (!response) {
    Alert.alert("Ошибка", "Не удалось получить документ");
    return;
  }

  try {
    const safeName = sanitizeFileName(fileName);
    const mimeType = getMimeTypeByFileName(safeName);

    const fileUri = getLocalFileUri(safeName);

    // Если уже скачан — просто открываем, без повторного скачивания/записи
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      if (info.exists && (info.size ?? 0) > 0) {
        await openFileUri(fileUri, mimeType);
        return fileUri;
      }
    } catch (e) {}

    const base64 = extractBase64FromApiResponse(response);

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await openFileUri(fileUri, mimeType);
    return fileUri;
  } catch (e) {
    Alert.alert("Ошибка", "Не удалось скачать документ");
  }
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
    await Sharing.shareAsync(uri);
  } else {
    await Sharing.shareAsync(uri);
  }
};

export const getFileInfo = async (fileName: string) => {
  try {
    const documentsDir = new Directory(Paths.document);
    const file = new File(documentsDir, fileName);
    
    return {
      exists: file.exists,
      uri: file.uri,
      size: file.size,
      isDirectory: false,
    };
  } catch (e) {
  }
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

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};