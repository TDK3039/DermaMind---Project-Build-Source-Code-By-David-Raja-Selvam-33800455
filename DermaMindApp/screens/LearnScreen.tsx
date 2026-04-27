import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LearnStackParamList } from "../types/navigation";

// Design system constants for consistent styling across the app 
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

export default function LearnScreen() {
  // Typed navigation for Learn stack
  const navigation =
    useNavigation<NativeStackNavigationProp<LearnStackParamList>>();

  // Static list of educational topics (could be fetched from backend later)
  const topics = [
    {
      title: "What Causes Acne?",
      image:
        "https://images.pexels.com/photos/20683630/pexels-photo-20683630.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: "Understanding Skin Types",
      image:
        "https://images.pexels.com/photos/6543612/pexels-photo-6543612.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: "How to Build a Skincare Routine",
      image:
        "https://images.pexels.com/photos/34918667/pexels-photo-34918667.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: "Ingredients to Avoid",
      image:
        "https://images.pexels.com/photos/8392586/pexels-photo-8392586.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: "How to Take a Good Scan",
      image:
        "https://images.pexels.com/photos/17450755/pexels-photo-17450755.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: "How DermaMind Works",
      image:
        "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: "Understanding Confidence Scores",
      image:
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Screen Header */}
      <Text style={styles.header}>Learn</Text>
      <Text style={styles.subheader}>
        Explore skincare topics and improve your routine.
      </Text>

      {/* Topic Cards */}
      {topics.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          activeOpacity={0.85} // subtle press feedback
          onPress={() =>
            navigation.navigate("LearnDetail", {
              title: item.title,
              image: item.image,
            })
          }
        >
          {/* Topic image */}
          <Image source={{ uri: item.image }} style={styles.cardImage} />

          {/* Title section */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Bottom spacing */}
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
    paddingTop: 10,
  },

  header: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: TEXT_DARK,
    marginTop: 60,
  },

  subheader: {
    fontSize: 15,
    textAlign: "center",
    color: TEXT_DARK,
    marginBottom: 30,
    marginTop: 6,
  },

  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 14,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    overflow: "hidden", // ensures rounded corners apply to image
  },

  cardImage: {
    width: "100%",
    height: 170,
  },

  cardContent: {
    paddingHorizontal: 15,
    paddingVertical: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_DARK,
  },
});
