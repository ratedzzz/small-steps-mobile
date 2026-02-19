export const MOUNTAIN_PALETTE = [
  "#FF9F1C", // Peach (Active)
  "#FFBF69", // Light Peach
  "#FFFFFF", // White
  "#CBF3F0", // Ice Blue
  "#2EC4B6", // Teal
];

export const APP_THEME = {
  // --- BACKGROUNDS ---
  solidBackground: "#001244", 
  containerBackground: "#001244", // Kept for backward compatibility
  
  // The main gradient used on backgrounds (Navy to lighter Navy)
  mainGradient: ["#001244", "#003366"] as const,
  
  // --- CARDS ---
  cardBg: "rgba(255, 255, 255, 0.1)", // New name (Glassmorphism)
  cardBackground: "rgba(255, 255, 255, 0.1)", // Old name (kept for compatibility)
  
  // --- TEXT ---
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  text: "#FFFFFF", // Kept for compatibility

  // --- ACCENTS ---
  activeTab: "#FF9F1C", // Peach/Gold
  inactiveTab: "#318fb5",
  accent: "#FF9F1C", // Kept for compatibility
  goldAccent: "#F1C453",
};