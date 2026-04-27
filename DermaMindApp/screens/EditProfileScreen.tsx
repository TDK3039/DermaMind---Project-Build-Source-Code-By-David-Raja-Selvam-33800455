import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Theme constants for consistent styling across the app ---
const PRIMARY = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const TEXT_DARK = "#1E1E1E";
const CARD_WHITE = "#FFFFFF";

export default function EditProfileScreen({ navigation }: any) {
  // Local state for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Validation state
  const [emailError, setEmailError] = useState("");

  // Animation values for fade + slide entrance and button press
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Run entrance animation when screen mounts 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Button press animation for subtle feedback ---
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Load stored user data from AsyncStorage 
  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");

      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    };

    loadUser();
  }, []);

  // Basic email validation ---
  const validateEmail = (value: string) => {
    setEmail(value);
    const regex = /\S+@\S+\.\S+/;
    setEmailError(regex.test(value) ? "" : "Invalid email format");
  };

  // Save updated profile info 
  const handleSave = async () => {
    if (!name.trim() || !email.trim() || emailError) {
      Alert.alert("Invalid Input", "Please enter a valid name and email.");
      return;
    }

    animateButton();

    await AsyncStorage.setItem("userName", name);
    await AsyncStorage.setItem("userEmail", email);

    Alert.alert("Profile Updated", "Your information has been saved.");
    navigation.goBack();
  };

  // Form validity check
  const isValid = name.trim() && email.trim() && !emailError;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BACKGROUND }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Animated wrapper for smooth screen entrance */}
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.title}>Edit Profile</Text>

        {/* Main card container */}
        <View style={styles.card}>
          {/* Name input */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#999"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          {/* Email input */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={validateEmail}
            autoCapitalize="none"
          />

          {/* Email validation error */}
          {emailError !== "" && (
            <Text style={styles.errorText}>{emailError}</Text>
          )}

          {/* Save button with press animation */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.saveButton, { opacity: isValid ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Cancel button */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// Stylesheet for layout and visual consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: TEXT_DARK,
    marginBottom: 25,
  },

  card: {
    backgroundColor: CARD_WHITE,
    padding: 22,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#F1F3F5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: TEXT_DARK,
  },

  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  saveText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  cancelText: {
    textAlign: "center",
    color: PRIMARY,
    marginTop: 15,
    fontSize: 16,
  },
});
