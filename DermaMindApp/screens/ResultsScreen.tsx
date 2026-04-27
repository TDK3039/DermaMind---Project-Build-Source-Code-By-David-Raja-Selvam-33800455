import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Design system constants
const PRIMARY_TURQUOISE = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

export default function ResultsScreen({ route, navigation }: any) {
  const { imageUri, result, fromLog } = route.params;

  // Confidence is already formatted by backend
  const formattedConfidence = result.confidence;

  // Animated values for metric bars
  const animRedness = useRef(new Animated.Value(0)).current;
  const animTexture = useRef(new Animated.Value(0)).current;
  const animInflammation = useRef(new Animated.Value(0)).current;
  const animBrightness = useRef(new Animated.Value(0)).current;

  // Animate all metric bars on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(animRedness, {
        toValue: result.scores.rednessIndex,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animTexture, {
        toValue: result.scores.textureRoughness,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animInflammation, {
        toValue: result.scores.inflammationIndex,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animBrightness, {
        toValue: result.scores.brightness,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // Save scan to history ONLY when coming from ScanScreen
  useEffect(() => {
    if (fromLog) return; // Prevent duplicate saves

    const saveScan = async () => {
      const newEntry = {
        id: Date.now().toString(),
        imageUri,
        prediction: result.prediction,
        confidence: result.confidence,
        severity: result.severity,
        scores: result.scores,
        recommendations: result.recommendations || [],
        metadata: result.metadata,
        timestamp: new Date().toISOString(),
      };

      try {
        const existing = await AsyncStorage.getItem("scanHistory");
        const history = existing ? JSON.parse(existing) : [];

        // Add newest scan to the top
        history.unshift(newEntry);

        await AsyncStorage.setItem("scanHistory", JSON.stringify(history));
      } catch (err) {
        console.log("Error saving scan:", err);
      }
    };

    saveScan();
  }, [fromLog]);

  // Reusable animated bar component
  const renderAnimatedBar = (animatedValue: Animated.Value) => {
    const width = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, { width }]} />
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        fromLog ? styles.fromLogPadding : styles.normalPadding,
      ]}
    >
      {/* Back button only when opened from LogScreen */}
      {fromLog && (
        <TouchableOpacity
          style={[styles.backButton, { top: 40 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      <View style={styles.inner}>
        {/* Scanned Image */}
        <Image source={{ uri: imageUri }} style={styles.image} />

        {/* Results Card */}
        <View style={styles.card}>
          {/* Condition */}
          <Text style={styles.label}>Condition</Text>
          <Text style={styles.prediction}>{result.prediction}</Text>

          {/* Confidence */}
          <Text style={styles.label}>Confidence</Text>
          <Text style={styles.confidence}>{formattedConfidence}</Text>

          {/* Severity */}
          <Text style={styles.label}>Severity</Text>
          <Text style={styles.severity}>{result.severity}</Text>

          {/* Skin Metrics */}
          <Text style={styles.metricsTitle}>Skin Metrics</Text>

          {/* REDNESS */}
          <View style={styles.metricRow}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Redness Index</Text>
              <Text style={styles.metricValueNumber}>
                {result.scores.rednessIndex.toFixed(1)}
              </Text>
            </View>
            {renderAnimatedBar(animRedness)}
          </View>

          {/* TEXTURE */}
          <View style={styles.metricRow}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Texture Roughness</Text>
              <Text style={styles.metricValueNumber}>
                {result.scores.textureRoughness.toFixed(1)}
              </Text>
            </View>
            {renderAnimatedBar(animTexture)}
          </View>

          {/* INFLAMMATION */}
          <View style={styles.metricRow}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Inflammation</Text>
              <Text style={styles.metricValueNumber}>
                {result.scores.inflammationIndex.toFixed(1)}
              </Text>
            </View>
            {renderAnimatedBar(animInflammation)}
          </View>

          {/* BRIGHTNESS */}
          <View style={styles.metricRow}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Brightness</Text>
              <Text style={styles.metricValueNumber}>
                {result.scores.brightness.toFixed(1)}
              </Text>
            </View>
            {renderAnimatedBar(animBrightness)}
          </View>

          {/* Mole Detection */}
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Mole Detected</Text>
            <Text style={styles.metricValue}>
              {result.scores.darkSpotsDetected ? "Yes" : "No"}
            </Text>
          </View>

          {/* Recommendations */}
          <Text style={styles.metricsTitle}>Recommendations</Text>
          {result.recommendations.map((rec: string, index: number) => (
            <Text key={index} style={styles.recommendation}>
              • {rec}
            </Text>
          ))}

          {/* Metadata */}
          <Text style={styles.metadata}>
            File: {result.metadata.filename}{"\n"}
            Size: {result.metadata.size} bytes{"\n"}
            Time: {new Date(result.metadata.analyzedAt).toLocaleString()}
          </Text>

          {/* Disclaimer */}
          <Text style={styles.note}>
            This result is generated by an AI prototype and should not be used for
            medical diagnosis.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
    backgroundColor: BACKGROUND,
    alignItems: "center",
  },
  normalPadding: {
    paddingTop: 2,
  },
  fromLogPadding: {
    paddingTop: 75,
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 20,
    padding: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: PRIMARY_TURQUOISE,
    fontWeight: "600",
  },
  inner: {
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: "90%",
    height: 260,
    borderRadius: 14,
    marginBottom: 20,
  },
  card: {
    width: "90%",
    backgroundColor: CARD_WHITE,
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 25,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  metricValueNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  label: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 10,
  },
  prediction: {
    fontSize: 26,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  confidence: {
    fontSize: 22,
    fontWeight: "600",
    color: PRIMARY_TURQUOISE,
  },
  severity: {
    fontSize: 20,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: TEXT_DARK,
  },
  metricRow: {
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  barBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: 10,
    backgroundColor: PRIMARY_TURQUOISE,
    borderRadius: 6,
  },
  recommendation: {
    fontSize: 14,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 15,
  },
  note: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 10,
  },
});
