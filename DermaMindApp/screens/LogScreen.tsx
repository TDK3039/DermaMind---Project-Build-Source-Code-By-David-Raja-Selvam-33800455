import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "react-native-vector-icons/Feather";
import { Swipeable } from "react-native-gesture-handler";

// Design system constants
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";
const TURQUOISE = "#1EB5A6";

// Type for each scan entry
type ScanHistoryItem = {
  id: string;
  imageUri: string;
  prediction: string;
  confidence: string;
  severity: string;
  scores: any;
  recommendations: string[];
  metadata: any;
  timestamp: string;
};

export default function LogScreen({ navigation }: any) {
  // Full scan history
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Sorting mode
  const [sortMode, setSortMode] = useState<
    "newest" | "oldest" | "confidence-high" | "confidence-low"
  >("newest");

  // Condition filter
  const [conditionFilter, setConditionFilter] = useState("All");

  // Multi-select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fade animation for smooth list updates
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in whenever history changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [history]);

  // Load scan history whenever screen becomes focused
  useEffect(() => {
    const loadHistory = async () => {
      const stored = await AsyncStorage.getItem("scanHistory");
      if (stored) setHistory(JSON.parse(stored));
    };

    const unsub = navigation.addListener("focus", loadHistory);
    return unsub;
  }, [navigation]);

  // Apply sorting whenever sort mode changes
  useEffect(() => {
    if (history.length === 0) return;

    let sorted = [...history];

    if (sortMode === "newest") {
      sorted.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } else if (sortMode === "oldest") {
      sorted.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    } else if (sortMode === "confidence-high") {
      sorted.sort(
        (a, b) =>
          parseFloat(b.confidence.replace("%", "")) -
          parseFloat(a.confidence.replace("%", ""))
      );
    } else if (sortMode === "confidence-low") {
      sorted.sort(
        (a, b) =>
          parseFloat(a.confidence.replace("%", "")) -
          parseFloat(b.confidence.replace("%", ""))
      );
    }

    setHistory(sorted);
  }, [sortMode]);

  // Cycle through sort modes in a loop
  const cycleSort = () => {
    if (sortMode === "newest") setSortMode("oldest");
    else if (sortMode === "oldest") setSortMode("confidence-high");
    else if (sortMode === "confidence-high") setSortMode("confidence-low");
    else setSortMode("newest");
  };

  // Enter multi-select mode
  const handleLongPress = (id: string) => {
    setSelectMode(true);
    setSelectedItems([id]);
  };

  // Toggle selection of an item
  const toggleSelect = (id: string) => {
    if (!selectMode) return;

    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Delete all selected items
  const deleteSelected = async () => {
    const updated = history.filter((item) => !selectedItems.includes(item.id));
    setHistory(updated);
    await AsyncStorage.setItem("scanHistory", JSON.stringify(updated));

    setSelectMode(false);
    setSelectedItems([]);
  };

  // Delete a single item via swipe
  const deleteItem = async (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    await AsyncStorage.setItem("scanHistory", JSON.stringify(updated));
  };

  // Clear entire history
  const clearAllHistory = async () => {
    await AsyncStorage.removeItem("scanHistory");
    setHistory([]);
  };

  // Confirmation popup for clearing all
  const confirmClearHistory = () => {
    Alert.alert(
      "Clear Scan History",
      "Are you sure you want to delete all scan history?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearAllHistory },
      ]
    );
  };

  // Apply condition filter
  const filteredHistory =
    conditionFilter === "All"
      ? history
      : history.filter((item) => item.prediction === conditionFilter);

  // Group scans by date (Today, This Week, Month)
  const groupByDate = () => {
    const groups: Record<string, ScanHistoryItem[]> = {};
    const now = new Date();
    const today = now.toDateString();

    filteredHistory.forEach((item) => {
      const date = new Date(item.timestamp);
      const dateString = date.toDateString();

      let groupLabel = "";

      if (dateString === today) {
        groupLabel = "Today";
      } else {
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

        if (diffDays <= 7) {
          groupLabel = "This Week";
        } else {
          const month = date.toLocaleString("default", { month: "long" });
          const year = date.getFullYear();
          groupLabel = `${month} ${year}`;
        }
      }

      if (!groups[groupLabel]) groups[groupLabel] = [];
      groups[groupLabel].push(item);
    });

    return Object.entries(groups);
  };

  const groupedData = groupByDate();

  // Swipe delete button UI
  const renderRightActions = (progress: any, itemId: string) =>
    !selectMode && (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(itemId)}
      >
        <Feather name="trash-2" size={20} color="#fff" />
      </TouchableOpacity>
    );

  // Render each scan card
  const renderItem = (item: ScanHistoryItem) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Swipeable
          enabled={!selectMode}
          renderRightActions={(p) => renderRightActions(p, item.id)}
        >
          <TouchableOpacity
            style={[styles.card, isSelected && styles.cardSelected]}
            activeOpacity={0.85}
            onLongPress={() => handleLongPress(item.id)}
            onPress={() =>
              selectMode
                ? toggleSelect(item.id)
                : navigation.navigate("Results", {
                    imageUri: item.imageUri,
                    result: item,
                    fromLog: true,
                  })
            }
          >
            {/* Selection checkbox */}
            {selectMode && (
              <Feather
                name={isSelected ? "check-circle" : "circle"}
                size={22}
                color={isSelected ? TURQUOISE : TEXT_MUTED}
                style={{ marginRight: 10 }}
              />
            )}

            {/* Thumbnail */}
            <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.prediction}>{item.prediction}</Text>

              <View style={styles.row}>
                <Feather name="activity" size={14} color={TEXT_MUTED} />
                <Text style={styles.confidenceText}>{item.confidence}</Text>
              </View>

              <View style={styles.row}>
                <Feather name="clock" size={14} color={TEXT_MUTED} />
                <Text style={styles.date}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Chevron */}
            {!selectMode && (
              <Feather name="chevron-right" size={22} color={TEXT_MUTED} />
            )}
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  // Condition filter options
  const conditions = ["All", "Acne", "Redness", "Rash", "Healthy Skin", "Texture"];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scan History</Text>

      {/* Sort + Multi-select Action Bar */}
      {history.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={cycleSort}>
            <Text style={styles.sortText}>
              Sort:{" "}
              {sortMode === "newest"
                ? "Newest"
                : sortMode === "oldest"
                ? "Oldest"
                : sortMode === "confidence-high"
                ? "Confidence (High → Low)"
                : "Confidence (Low → High)"}
            </Text>
          </TouchableOpacity>

          {selectMode ? (
            <TouchableOpacity onPress={deleteSelected}>
              <Text style={styles.deleteSelectedText}>
                Delete ({selectedItems.length})
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={confirmClearHistory}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Condition Filter Bar */}
      <View style={styles.filterRow}>
        {conditions.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setConditionFilter(c)}
            style={[
              styles.filterChip,
              conditionFilter === c && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                conditionFilter === c && styles.filterChipTextActive,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grouped Scan List */}
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const [groupLabel, items] = item;

          return (
            <View>
              <Text style={styles.groupHeader}>{groupLabel}</Text>

              {items.map((scan) => (
                <View key={scan.id}>{renderItem(scan)}</View>
              ))}
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 70,
  },

  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: TEXT_DARK,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sortText: {
    fontSize: 16,
    color: TURQUOISE,
    fontWeight: "600",
  },

  clearAllText: {
    fontSize: 16,
    color: "#DC3545",
    fontWeight: "600",
  },

  deleteSelectedText: {
    fontSize: 16,
    color: "#DC3545",
    fontWeight: "700",
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8,
  },

  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#E9ECEF",
  },

  filterChipActive: {
    backgroundColor: TURQUOISE,
  },

  filterChipText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },

  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  groupHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    backgroundColor: CARD_WHITE,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignItems: "center",
  },

  cardSelected: {
    borderWidth: 2,
    borderColor: TURQUOISE,
    backgroundColor: "#E8FFFB",
  },

  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 14,
  },

  info: {
    flex: 1,
  },

  prediction: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  confidenceText: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginLeft: 6,
  },

  date: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 6,
  },

  deleteButton: {
    backgroundColor: "#E63946",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 12,
    marginVertical: 8,
  },
});
