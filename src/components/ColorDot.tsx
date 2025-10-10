import React from 'react';
import { View } from 'react-native';

export const ColorDot = ({ color }: { color: string }) => (
  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color, marginRight: 6 }} />
);
