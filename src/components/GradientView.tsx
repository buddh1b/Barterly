// Wrapper that works in both Expo Go and native builds
import { View, ViewStyle } from 'react-native';

interface Props {
  colors: string[];
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export default function GradientView({ colors, style, children }: Props) {
  // Use the first color as background for Expo Go compatibility
  return (
    <View style={[style, { backgroundColor: colors[0] }]}>
      {children}
    </View>
  );
}