// src/components/ShapeSet.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface ShapeSetProps {
  shape?: "circle" | "square";
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const ShapeSet: React.FC<ShapeSetProps> = ({
  shape = "circle",
  size = 100,
  color = "#0c1c47",
  style,
}) => {
  const shapeStyle =
    shape === "circle"
      ? { borderRadius: size / 2 }
      : { borderRadius: 8 };

  return <View style={[styles.base, shapeStyle, { width: size, height: size, backgroundColor: color }, style]} />;
};

const styles = StyleSheet.create({
  base: {
    marginVertical: 20,
    alignSelf: "center",
  },
});
