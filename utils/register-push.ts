import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// How notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Ask permission, get an Expo push token, and save it on the user's profile.
 * Needs a physical device (or a recent iOS Simulator) for a real token.
 */
export async function registerPushToken(userId: string) {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    if (!Device.isDevice && Platform.OS === "ios") {
      // Simulators on older Xcode builds often can't register; still try on newer ones
      console.log("[push] simulator — attempting token registration anyway");
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") {
      console.log("[push] permission not granted");
      return null;
    }

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResult.data;
    console.log("[push] token", token);

    // Select only public columns — expo_push_token is not SELECT-able by clients
    const { error } = await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("id", userId)
      .select("id")
      .single();

    if (error) {
      console.error("[push] failed to save token", error);
      return null;
    }

    return token;
  } catch (e) {
    console.error("[push] register failed", e);
    return null;
  }
}
