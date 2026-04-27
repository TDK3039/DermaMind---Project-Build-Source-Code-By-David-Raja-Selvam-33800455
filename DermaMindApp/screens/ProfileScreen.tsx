import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// Theme constants for consistent styling across the app
const PRIMARY_TURQUOISE = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  // User profile state
  const [version, setVersion] = useState("");
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("user@example.com");

  // Load app version from package.json (runs once)
  useEffect(() => {
    try {
      const pkg = require("../../package.json");
      setVersion(pkg.version ?? "1.0.0");
    } catch {
      setVersion("1.0.0");
    }
  }, []);

  // Load stored user data from AsyncStorage
  const loadUser = async () => {
    const storedName = await AsyncStorage.getItem("userName");
    const storedEmail = await AsyncStorage.getItem("userEmail");

    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  };

  // Load user data on first mount
  useEffect(() => {
    loadUser();
  }, []);

  // Reload user data every time the screen becomes focused
  // Ensures updated name/email appear immediately after editing
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  // Clear scan history (with confirmation)
  const clearHistory = () => {
    Alert.alert(
      "Clear Scan History",
      "Are you sure you want to delete all scan history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("scanHistory");
            Alert.alert("History Cleared", "Your scan history has been removed.");
          },
        },
      ]
    );
  };

  // Logout handler
  const handleLogout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* USER CARD */}
      <View style={styles.card}>
        {/* Avatar circle with first letter of name */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>

        {/* User name + email */}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        {/* Edit Profile button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* APP INFORMATION SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>{version}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("About")}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>About DermaMind</Text>
            <Text style={styles.rowValue}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Privacy")}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Privacy Notice</Text>
            <Text style={styles.rowValue}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Terms of Use</Text>
            <Text style={styles.rowValue}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 25,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: PRIMARY_TURQUOISE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  email: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 15,
  },

  editButton: {
    backgroundColor: "#E9F7F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_TURQUOISE,
  },

  section: {
    backgroundColor: CARD_WHITE,
    padding: 15,
    borderRadius: 14,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: TEXT_DARK,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },

  rowLabel: {
    fontSize: 15,
    color: TEXT_DARK,
  },

  rowValue: {
    fontSize: 15,
    color: TEXT_MUTED,
  },

  logoutButton: {
    backgroundColor: PRIMARY_TURQUOISE,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
