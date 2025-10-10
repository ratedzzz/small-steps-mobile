DROP-IN FILES FOR SMALL-STEPS (Expo)

1) Make sure you created an Expo project first:
   npx create-expo-app small-steps-mobile --template blank --typescript
   cd small-steps-mobile
   npx expo install expo-router react-native-safe-area-context react-native-screens
   npm i zustand @react-native-async-storage/async-storage react-native-calendars
   npx expo install expo-notifications

2) Ensure package.json has:  "main": "expo-router/entry"

3) Unzip these files into your small-steps-mobile folder (they create app/ and src/).

4) Start with app/index.basic.tsx (already named index.tsx here). It boots with zero extra deps.
   After the above installs, you can replace index.tsx with app/index.full.tsx for the calendar UI.

5) Run: npx expo start

If you see lots of TypeScript errors, make sure you OPEN ONLY the 'small-steps-mobile' folder in VS Code (File -> Open Folder) so the web app's tsconfig/eslint doesn't affect this project.
