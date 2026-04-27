import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";

// --- Theme constants for consistent styling across the app ---
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

export default function HistoryScreen() {
  return (
    <ScrollView
      style={styles.container}
      // Center content vertically when there are no history items
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      {/* Empty-state card shown when no scan history exists */}
      <View style={styles.card}>
        <Text style={styles.body}>
          You haven’t completed any scans yet. Your scan history will appear
          here once you start using DermaMind.
        </Text>
      </View>
    </ScrollView>
  );
}

// --- Stylesheet for layout and visual consistency ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    padding: 20,
  },

  card: {
    backgroundColor: CARD_WHITE,
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  body: {
    fontSize: 18,
    color: TEXT_DARK,
    lineHeight: 26,
    textAlign: "center",
  },
});
