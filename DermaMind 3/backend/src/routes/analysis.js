const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const router = express.Router();

/**
 * Multer Configuration
 * --------------------
 * - Uses memory storage so images never touch disk.
 * - Limits file size to 20MB.
 * - Accepts only JPEG/PNG images.
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG and PNG images are allowed'));
  }
});

// Utility to clamp values into a safe range
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * POST /upload
 * ------------
 * Main AI analysis route.
 * Accepts an uploaded image, extracts colour + texture statistics using Sharp,
 * applies heuristic rules to classify skin conditions, and returns:
 * - prediction
 * - confidence
 * - severity
 * - metric scores
 * - recommendations
 * - metadata
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  console.log("UPLOAD ROUTE HIT");

  try {
    // Ensure an image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Extract pixel statistics using Sharp
    const image = sharp(req.file.buffer);
    const stats = await image.stats();

    const red = stats.channels[0];
    const green = stats.channels[1];
    const blue = stats.channels[2];

    // Basic metrics
    const brightness = (red.mean + green.mean + blue.mean) / 3;
    const rednessIndex = red.mean - green.mean;
    const saturationIndex = green.stdev + red.stdev; // inflammation proxy
    const textureRoughness = red.stdev;

    /**
     * Lighting Compensation
     * ---------------------
     * Bright images artificially inflate redness + texture.
     * We flatten these values to avoid false positives.
     */
    const brightnessFactor = 1 + (brightness - 120) / 150;
    const adjustedInflammation = saturationIndex / brightnessFactor;
    const adjustedTexture = textureRoughness / brightnessFactor;

    /**
     * Oily Skin Detection
     * -------------------
     * High brightness + high contrast + low texture = oily shine.
     */
    const oilyBrightness = brightness > 175;
    const oilyContrast = (red.max - red.min) > 75;
    const lowTexture = adjustedTexture < 34;
    const isOily = oilyBrightness && oilyContrast && lowTexture;

    /**
     * Healthy Skin Detection
     * ----------------------
     * Balanced brightness, low redness, low inflammation, smooth texture.
     */
    const healthyBrightness = brightness > 35 && brightness < 250;
    const lowRedness = rednessIndex < 20;
    const lowInflammation = adjustedInflammation < 110;
    const smoothTexture = adjustedTexture < 50;

    const isHealthy =
      healthyBrightness &&
      lowRedness &&
      lowInflammation &&
      smoothTexture &&
      !isOily;

    /**
     * Weak Signals → Healthy Skin
     * ---------------------------
     * If no strong abnormal patterns appear, classify as healthy.
     */
    const weakSignals =
      rednessIndex < 22 &&
      adjustedInflammation < 120 &&
      adjustedTexture < 55 &&
      !isOily;

    if (isHealthy || weakSignals) {
      return res.json({
        message: "Image analyzed successfully",
        prediction: "Healthy Skin",
        confidence: "90.5%",
        severity: "Low",
        scores: {
          brightness,
          rednessIndex,
          textureRoughness: adjustedTexture,
          inflammationIndex: adjustedInflammation,
          oilySkinDetected: false
        },
        recommendations: [
          "Maintain your current skincare routine",
          "Use SPF daily to protect your skin"
        ],
        metadata: {
          filename: req.file.originalname,
          size: req.file.size,
          analyzedAt: new Date().toISOString()
        }
      });
    }

    /**
     * Condition Classification
     * ------------------------
     * Build a list of possible conditions with a score,
     * then choose the strongest match.
     */
    const candidates = [];

    // Rash: high redness + high inflammation
    if (rednessIndex > 26 && adjustedInflammation > 125) {
      candidates.push({ label: "Rash", score: rednessIndex + adjustedInflammation });
    }

    // Acne: high texture + some redness
    if (adjustedTexture > 60 && rednessIndex > 14) {
      candidates.push({ label: "Acne", score: adjustedTexture + rednessIndex });
    }

    // Eczema: moderate texture + mild redness + lower inflammation
    if (adjustedTexture > 40 && rednessIndex > 6 && adjustedInflammation < 120) {
      candidates.push({ label: "Eczema", score: adjustedTexture + rednessIndex });
    }

    // Oily Skin
    if (isOily) {
      candidates.push({ label: "Oily Skin", score: 70 });
    }

    // If nothing matched → default to Healthy Skin
    if (candidates.length === 0) {
      return res.json({
        message: "Image analyzed successfully",
        prediction: "Healthy Skin",
        confidence: "88.0%",
        severity: "Low",
        scores: {
          brightness,
          rednessIndex,
          textureRoughness: adjustedTexture,
          inflammationIndex: adjustedInflammation,
          oilySkinDetected: false
        },
        recommendations: [
          "Maintain your current skincare routine",
          "Use SPF daily to protect your skin"
        ],
        metadata: {
          filename: req.file.originalname,
          size: req.file.size,
          analyzedAt: new Date().toISOString()
        }
      });
    }

    // Pick strongest candidate
    candidates.sort((a, b) => b.score - a.score);
    const prediction = candidates[0].label;

    /**
     * Confidence Calculation
     * ----------------------
     * Base confidence starts at 55% and increases depending on
     * how strong the detected signals are.
     */
    let baseConfidence = 0.55;

    if (prediction === "Rash") {
      baseConfidence += clamp((rednessIndex + adjustedInflammation) / 200, 0, 0.3);
    }

    if (prediction === "Acne") {
      baseConfidence += clamp(adjustedTexture / 130, 0, 0.3);
    }

    if (prediction === "Eczema") {
      baseConfidence += clamp((adjustedTexture + rednessIndex) / 200, 0, 0.25);
    }

    if (prediction === "Oily Skin") {
      baseConfidence += clamp((brightness - 140) / 150, 0, 0.15);
    }

    baseConfidence = clamp(baseConfidence, 0.55, 0.9);
    const confidencePercent = (baseConfidence * 100).toFixed(1) + "%";

    /**
     * Severity Calculation
     * --------------------
     * Based on thresholds for each condition.
     */
    let severityLabel = "Low";

    if (prediction === "Rash") {
      if (adjustedInflammation > 150) severityLabel = "High";
      else if (adjustedInflammation > 130) severityLabel = "Moderate";
    }

    if (prediction === "Acne") {
      if (adjustedTexture > 70) severityLabel = "High";
      else if (adjustedTexture > 60) severityLabel = "Moderate";
    }

    if (prediction === "Eczema") {
      if (adjustedTexture > 65) severityLabel = "High";
      else if (adjustedTexture > 50) severityLabel = "Moderate";
    }

    if (prediction === "Oily Skin") {
      severityLabel = brightness > 185 ? "Moderate" : "Low";
    }

    /**
     * Recommendations
     * ----------------
     * Simple mapping based on predicted condition.
     */
    const recommendationsMap = {
      "Acne": [
        "Cleanse twice daily with a gentle, non-comedogenic cleanser",
        "Avoid heavy oils and pore-clogging products"
      ],
      "Rash": [
        "Avoid potential irritants such as fragrances or harsh products",
        "Use a mild, fragrance-free moisturizer"
      ],
      "Eczema": [
        "Apply fragrance-free moisturizers regularly",
        "Avoid very hot showers and harsh soaps"
      ],
      "Oily Skin": [
        "Use a gentle foaming cleanser",
        "Consider a lightweight, oil-free moisturizer"
      ]
    };

    // Final response
    res.json({
      message: "Image analyzed successfully",
      prediction,
      confidence: confidencePercent,
      severity: severityLabel,
      scores: {
        brightness,
        rednessIndex,
        textureRoughness: adjustedTexture,
        inflammationIndex: adjustedInflammation,
        oilySkinDetected: isOily
      },
      recommendations: recommendationsMap[prediction],
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
