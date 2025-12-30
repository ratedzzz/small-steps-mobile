// src/theme.ts

// 1. The Mountain Palette (Lightest to Darkest)
export const MOUNTAIN_PALETTE = [
  "#f7d6bf", // 0: Peach
  "#b0cac7", // 1: Pale Blue/Green
  "#318fb5", // 2: Mid Blue
  "#005086", // 3: Dark Blue
  "#001244", // 4: Deepest Navy
];

// 2. THEME EXPORTS (This fixes your TypeScript errors)
export const APP_THEME = {
  // "as const" tells TS this array will ALWAYS have exactly these two colors
  mainGradient: [MOUNTAIN_PALETTE[0], MOUNTAIN_PALETTE[4]] as const, 
  solidBackground: MOUNTAIN_PALETTE[4], // Deep Navy
  text: "#FFFFFF",
};

// 3. Logic: Background Gradient (Light -> Dark), Items (Dark -> Light)
export const getHabitBackgroundColor = (index: number, total: number) => {
  if (total === 0) return MOUNTAIN_PALETTE[4];
  
  // Reverse palette for items so the top item is Navy (#001244)
  const itemPalette = [...MOUNTAIN_PALETTE].reverse();
  
  const position = index / (total - 1 || 1); 
  const colorIndex = Math.round(position * (itemPalette.length - 1));
  
  return itemPalette[colorIndex];
};

// 4. Logic: Text Color
export const getTextColorForBackground = (bgColor: string) => {
  const lightBackgrounds = ["#f7d6bf", "#b0cac7"];
  return lightBackgrounds.includes(bgColor) ? "#000000" : "#FFFFFF";
};