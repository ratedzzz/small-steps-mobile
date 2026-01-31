// src/theme.ts

// 1. The Exact Palette from your Image (Right to Left)
export const MOUNTAIN_PALETTE = [
  "#fcdfc8", // 0: Peach (Top/Right)
  "#b4d2cf", // 1: Mist/Pale Blue
  "#3d9bc4", // 2: Mid Blue
  "#055a8c", // 3: Dark Blue
  "#01153e", // 4: Deep Navy (Bottom/Left)
];

// 2. THEME EXPORTS
export const APP_THEME = {
  // Main background gradient (Peach -> Deep Navy)
  mainGradient: [
    MOUNTAIN_PALETTE[0], 
    MOUNTAIN_PALETTE[1], 
    MOUNTAIN_PALETTE[2], 
    MOUNTAIN_PALETTE[3], 
    MOUNTAIN_PALETTE[4]
  ] as const, 
  
  // Screen Background Fallback
  solidBackground: MOUNTAIN_PALETTE[4], // Deep Navy
  
  // Cards/Containers: Solid Navy
  containerBackground: "#032059", 
  
  // Design Rule: Items (Habits/Goals) use specific Dark Blue
  cardBackground: MOUNTAIN_PALETTE[3], // #055a8c
  
  // Accents
  accent: MOUNTAIN_PALETTE[0], // Peach
  goldAccent: "#F1C453",       // Gold

  text: "#FFFFFF",
};

// 3. Logic: Background Gradient for Items
// We keep the function signature so we don't break existing components, 
// but now it enforces the Uniform Dark Blue rule.
export const getHabitBackgroundColor = (index: number, total: number) => {
  return APP_THEME.cardBackground;
};

// 4. Logic: Text Color
// Since the card is always Dark Blue, the text is always White.
export const getTextColorForBackground = (bgColor: string) => {
  return "#FFFFFF";
};