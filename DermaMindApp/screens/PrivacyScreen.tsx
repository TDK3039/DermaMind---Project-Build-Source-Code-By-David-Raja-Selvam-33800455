import React, { useRef, useEffect } from "react";
import { ScrollView, Text, StyleSheet, View, Animated } from "react-native";

// Design system constants for consistent styling across the app
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#0c3151";

export default function PrivacyScreen() {
  // Animation values for fade + slide entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Run entrance animation when screen mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    // Animated wrapper for smooth screen transition
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingVertical: 40 }}
      >
        {/* Main content card */}
        <View style={styles.card}>
          <Text style={styles.title}>Privacy Notice</Text>

          <Text style={styles.body}>
            This prototype does not store personal data on external servers.
            Images are processed locally on your device or your local backend
            during testing. No data is shared with third parties.
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// Stylesheet for layout and visual consistency 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    padding: 20,
  },

  card: {
    backgroundColor: CARD_WHITE,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 12,
    textAlign: "center",
  },

  body: {
    fontSize: 16,
    color: TEXT_MUTED,
    lineHeight: 24,
    textAlign: "center",
  },
});
