/** Yo-inspired art direction: flat purple, bold black type, almost no chrome */
import { roboto } from "@/fonts";

export const colors = {
  purple: "#9B59B6",
  purpleDark: "#8E44AD",
  purpleDeep: "#6C3483",
  yellow: "#F4D03F", // accent only (selection / ping)
  black: "#111111",
  white: "#FFFFFF",
  cream: "#F7F3FA",
  muted: "#6B6570",
  border: "#E8DFEF",
  danger: "#C0392B",
};

export const type = {
  hero: {
    fontFamily: roboto.black,
    fontSize: 64,
    fontWeight: "900" as const,
    letterSpacing: -2,
    color: colors.black,
  },
  title: {
    fontFamily: roboto.black,
    fontSize: 28,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
    color: colors.black,
  },
  body: {
    fontFamily: roboto.bold,
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.black,
  },
  meta: {
    fontFamily: roboto.medium,
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.muted,
  },
};
