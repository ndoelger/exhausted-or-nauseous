export type FontWeights = {
  regular: string;
  medium: string;
  bold: string;
  black: string;
};

export type FontOption = {
  id: string;
  label: string;
  weights: FontWeights;
};

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "roboto",
    label: "Roboto",
    weights: {
      regular: "Roboto_400Regular",
      medium: "Roboto_500Medium",
      bold: "Roboto_700Bold",
      black: "Roboto_900Black",
    },
  },
  {
    id: "inter",
    label: "Inter",
    weights: {
      regular: "Inter_400Regular",
      medium: "Inter_500Medium",
      bold: "Inter_700Bold",
      black: "Inter_900Black",
    },
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    weights: {
      regular: "SpaceGrotesk_400Regular",
      medium: "SpaceGrotesk_500Medium",
      bold: "SpaceGrotesk_700Bold",
      black: "SpaceGrotesk_700Bold",
    },
  },
  {
    id: "rubik",
    label: "Rubik",
    weights: {
      regular: "Rubik_400Regular",
      medium: "Rubik_500Medium",
      bold: "Rubik_700Bold",
      black: "Rubik_900Black",
    },
  },
  {
    id: "oswald",
    label: "Oswald",
    weights: {
      regular: "Oswald_400Regular",
      medium: "Oswald_500Medium",
      bold: "Oswald_700Bold",
      black: "Oswald_700Bold",
    },
  },
  {
    id: "bebas-neue",
    label: "Bebas Neue",
    weights: {
      regular: "BebasNeue_400Regular",
      medium: "BebasNeue_400Regular",
      bold: "BebasNeue_400Regular",
      black: "BebasNeue_400Regular",
    },
  },
  {
    id: "poppins",
    label: "Poppins",
    weights: {
      regular: "Poppins_400Regular",
      medium: "Poppins_500Medium",
      bold: "Poppins_700Bold",
      black: "Poppins_700Bold",
    },
  },
  {
    id: "montserrat",
    label: "Montserrat",
    weights: {
      regular: "Montserrat_400Regular",
      medium: "Montserrat_500Medium",
      bold: "Montserrat_700Bold",
      black: "Montserrat_900Black",
    },
  },
  {
    id: "nunito",
    label: "Nunito",
    weights: {
      regular: "Nunito_400Regular",
      medium: "Nunito_500Medium",
      bold: "Nunito_700Bold",
      black: "Nunito_900Black",
    },
  },
  {
    id: "raleway",
    label: "Raleway",
    weights: {
      regular: "Raleway_400Regular",
      medium: "Raleway_500Medium",
      bold: "Raleway_700Bold",
      black: "Raleway_900Black",
    },
  },
  {
    id: "work-sans",
    label: "Work Sans",
    weights: {
      regular: "WorkSans_400Regular",
      medium: "WorkSans_500Medium",
      bold: "WorkSans_700Bold",
      black: "WorkSans_900Black",
    },
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    weights: {
      regular: "DMSans_400Regular",
      medium: "DMSans_500Medium",
      bold: "DMSans_700Bold",
      black: "DMSans_900Black",
    },
  },
  {
    id: "outfit",
    label: "Outfit",
    weights: {
      regular: "Outfit_400Regular",
      medium: "Outfit_500Medium",
      bold: "Outfit_700Bold",
      black: "Outfit_900Black",
    },
  },
  {
    id: "manrope",
    label: "Manrope",
    weights: {
      regular: "Manrope_400Regular",
      medium: "Manrope_500Medium",
      bold: "Manrope_700Bold",
      black: "Manrope_700Bold",
    },
  },
  {
    id: "lexend",
    label: "Lexend",
    weights: {
      regular: "Lexend_400Regular",
      medium: "Lexend_500Medium",
      bold: "Lexend_700Bold",
      black: "Lexend_900Black",
    },
  },
  {
    id: "fredoka",
    label: "Fredoka",
    weights: {
      regular: "Fredoka_400Regular",
      medium: "Fredoka_500Medium",
      bold: "Fredoka_700Bold",
      black: "Fredoka_700Bold",
    },
  },
];

/** App default font pack */
export const fonts =
  FONT_OPTIONS.find((f) => f.id === "dm-sans")?.weights ??
  FONT_OPTIONS[0].weights;

/** Spread into text styles: `{ ...font.black, fontSize: 16 }` */
export const font = {
  regular: { fontFamily: fonts.regular, fontWeight: "normal" as const },
  medium: { fontFamily: fonts.medium, fontWeight: "normal" as const },
  bold: { fontFamily: fonts.bold, fontWeight: "normal" as const },
  black: { fontFamily: fonts.black, fontWeight: "normal" as const },
};

/** @deprecated alias */
export const roboto = fonts;
