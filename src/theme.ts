export const getTheme = (darkMode: boolean) => ({
  bg: darkMode ? '#0F172A' : '#F8FAFC',
  cardBg: darkMode ? '#1E293B' : '#FFFFFF',
  text: darkMode ? '#F1F5F9' : '#0F172A',
  textSecondary: darkMode ? '#94A3B8' : '#64748B',
  primary: darkMode ? '#818CF8' : '#6366F1',
  inputBg: darkMode ? '#0F172A' : '#F8FAFC',
  border: darkMode ? '#334155' : '#E2E8F0',
  placeholder: darkMode ? '#64748B' : '#94A3B8',
});