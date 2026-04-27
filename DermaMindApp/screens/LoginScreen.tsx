import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme constants for consistent styling across the app
const PRIMARY = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const TEXT_DARK = "#1E1E1E";
const CARD_WHITE = "#FFFFFF";

export default function LoginScreen({ navigation }: any) {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Shake animation for invalid input
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  // Basic email validation
  const validateEmail = (value: string) => {
    setEmail(value);
    const regex = /\S+@\S+\.\S+/;
    setEmailError(regex.test(value) ? "" : "Invalid email format");
  };

  // Login handler (mock login for prototype)
  const handleLogin = async () => {
    if (!email || !password || emailError) {
      triggerShake();
      return;
    }

    setLoading(true);

    // Save login state + user info
    await AsyncStorage.setItem("isLoggedIn", "true");
    await AsyncStorage.setItem("userName", "User");
    await AsyncStorage.setItem("userEmail", email);

    setLoading(false);
    navigation.replace("Tabs");
  };

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const isValid = email && password && !emailError;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      {/* Login Card */}
      <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
        
        {/* Email Input */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={validateEmail}
          autoCapitalize="none"
        />

        {/* Email validation error */}
        {emailError !== "" && <Text style={styles.errorText}>{emailError}</Text>}

        {/* Password Input + Show/Hide */}
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.loginButton, { opacity: isValid ? 1 : 0.5 }]}
            onPress={() => {
              animateButton();
              handleLogin();
            }}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Log In</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Signup Link */}
        <TouchableOpacity onPress={() => navigation.navigate("Signup", { animate: true })}>
          <Text style={styles.skipText}>Create an account</Text>
        </TouchableOpacity>

        {/* Guest Login */}
        <TouchableOpacity
          onPress={async () => {
            setLoading(true);
            await AsyncStorage.setItem("isLoggedIn", "true");
            await AsyncStorage.setItem("userName", "Guest User");
            await AsyncStorage.setItem("userEmail", "guest@example.com");
            setLoading(false);
            navigation.replace("Tabs");
          }}
        >
          <Text style={styles.skipText}>Continue without account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Stylesheet for layout and visual consistency 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: TEXT_DARK,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6C757D",
    marginBottom: 30,
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

  input: {
    backgroundColor: "#F1F3F5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    color: TEXT_DARK,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  showText: {
    color: PRIMARY,
    fontWeight: "600",
    marginLeft: 10,
  },

  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },

  loginButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  loginText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  skipText: {
    textAlign: "center",
    color: PRIMARY,
    marginTop: 15,
    fontSize: 16,
  },
});
