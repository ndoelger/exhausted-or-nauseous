import React from "react";
import { StyleSheet, Text, TextInput } from "react-native";

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

/** Active UI font pack — switched by the DEV font picker */
let activeWeights: FontWeights = {
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  bold: "Roboto_700Bold",
  black: "Roboto_900Black",
};

let activeFontId = "roboto";
const listeners = new Set<() => void>();

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
];

/** Theme helpers — mirror active pack */
export const roboto = {
  get regular() {
    return activeWeights.regular;
  },
  get medium() {
    return activeWeights.medium;
  },
  get bold() {
    return activeWeights.bold;
  },
  get black() {
    return activeWeights.black;
  },
};

export function getActiveFontId() {
  return activeFontId;
}

export function setActiveFont(id: string) {
  const option = FONT_OPTIONS.find((f) => f.id === id);
  if (!option) return;
  activeFontId = option.id;
  activeWeights = option.weights;
  listeners.forEach((l) => l());
}

export function subscribeFontChange(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function weightToFamily(weight: string): string {
  switch (weight) {
    case "100":
    case "200":
    case "300":
    case "400":
    case "normal":
      return activeWeights.regular;
    case "500":
    case "600":
      return activeWeights.medium;
    case "700":
    case "bold":
      return activeWeights.bold;
    case "800":
    case "900":
      return activeWeights.black;
    default:
      return activeWeights.regular;
  }
}

function fontFamilyForStyle(style: unknown): string {
  const flat = StyleSheet.flatten(style as object) ?? {};
  // Ignore previously applied pack families so switching works
  const known = new Set(
    FONT_OPTIONS.flatMap((o) => Object.values(o.weights)),
  );
  if (
    typeof flat.fontFamily === "string" &&
    flat.fontFamily.length > 0 &&
    !known.has(flat.fontFamily)
  ) {
    return flat.fontFamily;
  }
  const weight = flat.fontWeight != null ? String(flat.fontWeight) : "400";
  return weightToFamily(weight);
}

let patched = false;

function patchTextComponent(Component: typeof Text | typeof TextInput) {
  const Comp = Component as typeof Text & {
    render?: (...args: unknown[]) => React.ReactElement;
  };
  const originalRender = Comp.render;
  if (!originalRender) return;

  const patchedRender = function (this: unknown, ...args: unknown[]) {
    const element = originalRender.apply(this, args) as React.ReactElement<{
      style?: unknown;
    }>;
    return React.cloneElement(element, {
      style: [
        { fontFamily: fontFamilyForStyle(element.props.style) },
        element.props.style,
        { fontWeight: "normal" as const },
      ],
    });
  };
  Comp.render = patchedRender;
}

/** Call once after fonts are loaded. */
export function applyFontDefaults() {
  if (patched) return;
  patched = true;
  patchTextComponent(Text);
  patchTextComponent(TextInput);
}

/** @deprecated use applyFontDefaults */
export const applyRobotoDefaults = applyFontDefaults;
