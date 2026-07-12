/** Flat navy, bold type, almost no chrome */
import { fonts } from "@/fonts";

export const colors = {
  purple: "#1B2A4A", // brand / screen bg (navy)
  purpleDark: "#152238",
  purpleDeep: "#0F1A2E",
  yellow: "#009c4e", // accent only (selection / ping)
  black: "#111111",
  white: "#FFFFFF",
  cream: "#F0F3F8",
  muted: "#5C6570",
  border: "#D8DEE8",
  danger: "#C0392B",
};

export const type = {
  hero: {
    fontFamily: fonts.black,
    fontSize: 64,
    fontWeight: "normal" as const,
    letterSpacing: -2,
    color: colors.black,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 28,
    fontWeight: "normal" as const,
    letterSpacing: -0.5,
    color: colors.black,
  },
  body: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: "normal" as const,
    color: colors.black,
  },
  meta: {
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: "normal" as const,
    color: colors.muted,
  },
};
