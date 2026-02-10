import { ColorToken, RadiusToken, ShadowToken, SpaceToken } from "./types";

export const colors: Record<ColorToken, string> = {
  bg: "#20201D",
  pine: "#213834",
  terracotta: "#D1411C",
  ivory: "#EFEDEA"
};

export const space: Record<SpaceToken, string> = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  xxl: "2rem"
};

export const radius: Record<RadiusToken, string> = {
  card: "1rem",
  panel: "1.25rem",
  pill: "999px"
};

export const shadow: Record<ShadowToken, string> = {
  card: "0 8px 24px rgba(0, 0, 0, 0.24)",
  hover: "0 12px 28px rgba(0, 0, 0, 0.3)"
};