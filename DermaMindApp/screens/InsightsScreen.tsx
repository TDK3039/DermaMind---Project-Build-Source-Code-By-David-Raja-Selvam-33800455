import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native"; // ⭐ Needed for auto-refresh

const PRIMARY_TURQUOISE = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

export default function InsightsScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filter, setFilter] = useState<"7" | "30" | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const [mostCommon, setMostCommon] = useState("N/A");
  const [avgConfidence, setAvgConfidence] = useState("N/A");
  const [avgSeverity, setAvgSeverity] = useState("N/A");
  const [avgRedness, setAvgRedness] = useState("N/A");
  const [avgInflammation, setAvgInflammation] = useState("N/A");
  const [moleRate, setMoleRate] = useState("N/A");

  // ⭐ Load scan history from AsyncStorage
  const loadData = async () => {
    const data = await AsyncStorage.getItem("scanHistory");
    if (!data) return;

    const scans = JSON.parse(data);
    setHistory(scans);
    applyFilter(scans, filter);
  };

  // Run once on first mount
  useEffect(() => {
    loadData();
  }, []);

  // Run every time the screen becomes focused
  // This is the fix that makes Insights update instantly
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [filter])
  );

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  // Recalculate when filter changes
  useEffect(() => {
    applyFilter(history, filter);
  }, [filter]);

  // Apply date filter
  const applyFilter = (scans: any[], mode: "7" | "30" | "all") => {
    if (mode === "all") {
      setFiltered(scans);
      calculateAll(scans);
      return;
    }

    const days = mode === "7" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const filteredScans = scans.filter((s) => {
      const t = new Date(s.timestamp).getTime();
      return t >= cutoff;
    });

    setFiltered(filteredScans);
    calculateAll(filteredScans);
  };

  // Calculate all metrics
  const calculateAll = (scans: any[]) => {
    if (scans.length === 0) {
      setMostCommon("N/A");
      setAvgConfidence("N/A");
      setAvgSeverity("N/A");
      setAvgRedness("N/A");
      setAvgInflammation("N/A");
      setMoleRate("N/A");
      return;
    }

    calculateMostCommon(scans);
    calculateAverageConfidence(scans);
    calculateAverageSeverity(scans);
    calculateAverageRedness(scans);
    calculateAverageInflammation(scans);
    calculateMoleRate(scans);
  };

  const calculateMostCommon = (scans: any[]) => {
    const valid = scans.filter((s) => s.prediction);
    if (valid.length === 0) return setMostCommon("N/A");

    const counts: Record<string, number> = {};
    valid.forEach((scan) => {
      counts[scan.prediction] = (counts[scan.prediction] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    setMostCommon(sorted[0][0]);
  };

  const calculateAverageConfidence = (scans: any[]) => {
    const valid = scans.filter((s) => s.confidence);
    if (valid.length === 0) return setAvgConfidence("N/A");

    const values = valid.map((s) =>
      parseFloat(s.confidence.replace("%", ""))
    );

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    setAvgConfidence(avg.toFixed(1) + "%");
  };

  const calculateAverageSeverity = (scans: any[]) => {
    const map: any = { Low: 1, Moderate: 2, High: 3 };

    const valid = scans.filter((s) => s.severity && map[s.severity]);
    if (valid.length === 0) return setAvgSeverity("N/A");

    const values = valid.map((s) => map[s.severity]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    const reverseMap: any = { 1: "Low", 2: "Moderate", 3: "High" };
    setAvgSeverity(reverseMap[Math.round(avg)]);
  };

  const calculateAverageRedness = (scans: any[]) => {
    const valid = scans.filter((s) => s.scores?.rednessIndex !== undefined);
    if (valid.length === 0) return setAvgRedness("N/A");

    const values = valid.map((s) => s.scores.rednessIndex);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    setAvgRedness(avg.toFixed(1));
  };

  const calculateAverageInflammation = (scans: any[]) => {
    const valid = scans.filter((s) => s.scores?.inflammationIndex !== undefined);
    if (valid.length === 0) return setAvgInflammation("N/A");

    const values = valid.map((s) => s.scores.inflammationIndex);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    setAvgInflammation(avg.toFixed(1));
  };

  const calculateMoleRate = (scans: any[]) => {
    const valid = scans.filter((s) => s.scores?.darkSpotsDetected !== undefined);
    if (valid.length === 0) return setMoleRate("N/A");

    const count = valid.filter((s) => s.scores.darkSpotsDetected).length;
    const rate = (count / valid.length) * 100;

    setMoleRate(rate.toFixed(1) + "%");
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={PRIMARY_TURQUOISE}
        />
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Insights</Text>

      {/* FILTER BUTTONS */}
      <View style={styles.filterRow}>
        {["7", "30", "all"].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.filterButton,
              filter === mode && styles.filterActive,
            ]}
            onPress={() => setFilter(mode as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === mode && styles.filterTextActive,
              ]}
            >
              {mode === "7" ? "7 Days" : mode === "30" ? "30 Days" : "All Time"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* METRIC CARDS */}
      <View style={styles.card}>
        <Feather name="list" size={20} color={PRIMARY_TURQUOISE} />
        <View style={styles.cardContent}>
          <Text style={styles.label}>Total Scans</Text>
          <Text style={styles.value}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Feather name="alert-circle" size={20} color={PRIMARY_TURQUOISE} />
        <View style={styles.cardContent}>
          <Text style={styles.label}>Most Common Condition</Text>
          <Text style={styles.value}>{mostCommon}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Feather name="percent" size={20} color={PRIMARY_TURQUOISE} />
        <View style={styles.cardContent}>
          <Text style={styles.label}>Average Confidence</Text>
          <Text style={styles.value}>{avgConfidence}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Feather name="thermometer" size={20} color={PRIMARY_TURQUOISE} />
        <View style={styles.cardContent}>
          <Text style={styles.label}>Average Severity</Text>
          <Text style={styles.value}>{avgSeverity}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Feather name="droplet" size={20} color={PRIMARY_TURQUOISE} />
        <View style={styles.cardContent}>
          <Text style={styles.label}>Average Redness</Text>
          <Text style={styles.value}>{avgRedness}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Feather name="activity" size={20} color={PRIMARY_TURQUOISE} />
        <View style={styles.cardContent}>
          <Text style={styles.label}>Average Inflammation</Text>
          <Text style={styles.value}>{avgInflammation}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Feather name="eye" size={20} color={PRIMARY_TURQUOISE} />
        <View style={styles.cardContent}>
          <Text style={styles.label}>Mole Detection Rate</Text>
          <Text style={styles.value}>{moleRate}</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Insights are based on your saved scan history.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: BACKGROUND,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
    color: TEXT_DARK,
    textAlign: "center",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#E0E0E0",
  },

  filterActive: {
    backgroundColor: PRIMARY_TURQUOISE,
  },

  filterText: {
    textAlign: "center",
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#fff",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_WHITE,
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  cardContent: {
    marginLeft: 12,
  },

  label: {
    fontSize: 14,
    color: TEXT_MUTED,
  },

  value: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
    color: PRIMARY_TURQUOISE,
  },

  note: {
    marginTop: 20,
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: "center",
  },
});
