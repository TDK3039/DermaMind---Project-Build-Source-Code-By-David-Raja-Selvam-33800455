import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme constants for consistent styling across the app
const PRIMARY_TURQUOISE = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = React.useState("");

  // Load user's name from AsyncStorage when screen mounts
  React.useEffect(() => {
    const loadName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        if (name) setUserName(name);
      } catch (err) {
        console.log("Error loading name:", err);
      }
    };

    loadName();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header greeting */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Hi {userName || "there"},</Text>
        <Text style={styles.subheader}>Welcome to DermaMind</Text>
      </View>

      {/* Start Scan Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start a New Scan</Text>
        <Text style={styles.cardText}>
          Take a quick scan to get AI‑powered insights about your skin.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Scan")}
        >
          <Text style={styles.primaryButtonText}>Scan Now</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <Text style={styles.cardText}>View your latest scans and trends.</Text>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate("Log")}
        >
          <Text style={styles.outlineButtonText}>View Log</Text>
        </TouchableOpacity>
      </View>

      {/* Learn Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learn About Your Skin</Text>
        <Text style={styles.cardText}>
          Explore guides and tips to improve your skincare routine.
        </Text>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate("Learn")}
        >
          <Text style={styles.outlineButtonText}>Browse Articles</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          DermaMind provides AI‑generated insights and is not a substitute for professional medical advice. 
          Consult a qualified healthcare provider for serious or persistent concerns.
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Stylesheet for layout and visual consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
  },

  headerContainer: {
    marginTop: 70,
    marginBottom: 40,
    alignItems: "center",
  },

  header: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: TEXT_DARK,
    marginBottom: 4,
  },

  subheader: {
    fontSize: 15,
    textAlign: "center",
    color: TEXT_DARK,
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 14,
    padding: 18,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 6,
    color: TEXT_DARK,
  },

  cardText: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 16,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: PRIMARY_TURQUOISE,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  outlineButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: PRIMARY_TURQUOISE,
  },

  outlineButtonText: {
    color: PRIMARY_TURQUOISE,
    fontWeight: "600",
    fontSize: 16,
  },

  disclaimerContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },

  disclaimerText: {
    fontSize: 15,
    color: TEXT_DARK,
    textAlign: "center",
    lineHeight: 20,
  },
});
