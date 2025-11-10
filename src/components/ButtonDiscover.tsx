// src/components/ButtonDiscover.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, Linking } from "react-native";
import { COLORS, FONTS } from "@/styles/theme";

interface ButtonDiscoverProps {
  text?: string;
  href?: string;
  onPress?: () => void;
  style?: object;
}

export const ButtonDiscover: React.FC<ButtonDiscoverProps> = ({
  text = "",
  href,
  onPress,
  style,
}) => {
  const handlePress = () => {
    if (href && href !== "#") {
      Linking.openURL(href);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRadius: 12,
    width: 356,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    ...FONTS.p,
    color: "#000",
  },
});
