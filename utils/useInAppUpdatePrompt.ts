import * as Updates from "expo-updates";
import { useEffect } from "react";

export function useInAppUpdatePrompt() {
  const { isUpdateAvailable, isUpdatePending, availableUpdate, isDownloading } =
    Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  const checkManually = async () => {
    const res = await Updates.checkForUpdateAsync();
    if (res.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  };

  return { isUpdateAvailable, availableUpdate, checkManually, isDownloading };
}
