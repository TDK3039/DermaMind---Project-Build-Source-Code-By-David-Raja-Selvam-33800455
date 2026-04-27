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

const PRIMARY = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const TEXT_DARK = "#1E1E1E";
const CARD_WHITE = "#FFFFFF";

export default function SignupScreen({ navigation, route }: any) {
  // Optional animation when navigating from Login
  const animate = route?.params?.animate;

  // Entrance animation values
  const fadeAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animate ? 40 : 0)).current;

  // Run entrance animation only when requested
  React.useEffect(() => {
    if (animate) {
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
    }
  }, []);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation + UI state
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animations for shake + button press
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

  // Handle signup + save user data
  const handleSignup = async () => {
    if (!name || !email || !password || emailError) {
      triggerShake();
      return;
    }

    setLoading(true);

    // Save user info locally
    await AsyncStorage.setItem("userName", name);
    await AsyncStorage.setItem("userEmail", email);
    await AsyncStorage.setItem("isLoggedIn", "true");

    setLoading(false);

    // Navigate to main app
    navigation.replace("Tabs");
  };

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const isValid = name && email && password && !emailError;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header */}
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join DermaMind today</Text>

      {/* Signup Card */}
      <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
        
        {/* Name */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#999"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        {/* Email */}
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

        {/* Password + Show/Hide */}
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

        {/* Signup Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.signupButton, { opacity: isValid ? 1 : 0.5 }]}
            onPress={() => {
              animateButton();
              handleSignup();
            }}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Login Link */}
        <TouchableOpacity onPress={() => navigation.navigate("Login", { animate: true })}>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// Stylesheet
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

  signupButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  signupText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  loginLink: {
    textAlign: "center",
    color: PRIMARY,
    marginTop: 15,
    fontSize: 16,
  },
});
