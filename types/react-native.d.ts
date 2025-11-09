// Minimal declaration to let TypeScript accept imports from 'react-native'.
// Prefer installing @types/react-native instead for full typings.
declare module 'react-native' {
  const ReactNative: any;
  export = ReactNative;
}
