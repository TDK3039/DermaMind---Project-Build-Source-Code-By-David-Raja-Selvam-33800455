import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

// Design system constants for consistent styling across the app
const PRIMARY_TURQUOISE = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

export default function LearnDetailScreen({ route }: any) {
  // Receive title + image from LearnScreen navigation
  const { title, image } = route.params;

  // Lookup table containing article content for each topic
  const contentMap: Record<string, string> = {
    "What Causes Acne?": `Acne forms when pores become clogged with excess oil, dead skin cells, and bacteria. Hormones play a major role especially during puberty, stress, or changes in sleep.

Other common triggers include heavy skincare products, sweating, friction from clothing, and not cleansing properly.

To reduce acne, focus on gentle cleansing, avoiding pore‑clogging products, and using ingredients like salicylic acid or niacinamide.`,

    "Understanding Skin Types": `There are five main skin types: normal, oily, dry, combination, and sensitive.

• Oily skin produces excess sebum and may appear shiny.  
• Dry skin lacks moisture and may feel tight or flaky.  
• Combination skin is oily in some areas and dry in others.  
• Sensitive skin reacts easily to products or environmental changes.  
• Normal skin is balanced and not overly oily or dry.

Knowing your skin type helps you choose the right products.`,

    "How to Build a Skincare Routine": `A simple and effective skincare routine has three steps:

1. Cleanser — removes dirt, oil, and sunscreen.  
2. Moisturiser — keeps the skin barrier healthy.  
3. SPF (morning only) — protects against UV damage.

Optional steps include exfoliants, serums, and targeted treatments.`,

    "Ingredients to Avoid": `Some skincare ingredients can irritate or worsen certain skin conditions.

Avoid these if you have sensitive or acne‑prone skin:
• Heavy oils like coconut oil  
• Fragrance and essential oils  
• Alcohol‑based toners  
• Harsh scrubs

Always patch‑test new products.`,

    "How to Take a Good Scan": `For the most accurate AI skin analysis:

• Use natural or bright lighting  
• Hold the phone 20–30 cm from your face  
• Keep your face centred  
• Avoid shadows  
• Keep a neutral expression

Good lighting helps the AI read your skin metrics correctly.`,

    "How DermaMind Works": `DermaMind analyses your photo using colour values, texture patterns, and brightness levels.

It measures:
• Redness  
• Texture  
• Inflammation  
• Brightness

These metrics combine to produce a prediction and confidence score.`,

    "Understanding Confidence Scores": `The confidence score reflects how strongly the AI believes the detected pattern matches a specific skin condition.

Confidence is influenced by:
• Lighting  
• Texture clarity  
• Redness levels  
• Pattern similarity

Low confidence usually means the lighting or image quality was unclear.`,
  };

  // Fallback text if a topic is missing from the map
  const articleText = contentMap[title] || "Educational content coming soon.";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Article Title */}
      <Text style={styles.header}>{title}</Text>

      {/* Optional article image (passed from LearnScreen) */}
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* Article Content Card */}
      <View style={styles.card}>
        <Text style={styles.body}>{articleText}</Text>
      </View>

      {/* Spacer for clean bottom padding */}
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

  header: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 20,
    textAlign: "center",
    color: TEXT_DARK,
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
  },

  card: {
    backgroundColor: CARD_WHITE,
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 40,
  },

  body: {
    fontSize: 17,
    color: TEXT_DARK,
    lineHeight: 24,
  },
});
