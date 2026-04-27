import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScanStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PRIMARY_TURQUOISE = "#1EB5A6";
const BACKGROUND = "#F8F9FA";
const CARD_WHITE = "#FFFFFF";
const TEXT_DARK = "#1E1E1E";
const TEXT_MUTED = "#6C757D";

type UploadPhotoNavProp = NativeStackNavigationProp<
  ScanStackParamList,
  "UploadPhoto"
>;

export default function UploadPhoto() {
  const navigation = useNavigation<UploadPhotoNavProp>();
  const route = useRoute<any>();

  // If user navigated from ScanScreen with an image, pre-fill it
  const passedUri = route.params?.imageUri ?? null;

  // Local state
  const [imageUri, setImageUri] = useState<string | null>(passedUri);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Success animation
  const successAnim = useRef(new Animated.Value(0)).current;

  // Sync passed image when navigating back
  useEffect(() => {
    if (passedUri) setImageUri(passedUri);
  }, [passedUri]);

  // Pick image from gallery
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (response.assets?.length) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  // Take a new photo
  const takePhoto = () => {
    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (response.assets?.length) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  // Upload selected image to backend
  const uploadImage = async () => {
    if (!imageUri) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    // Handle successful upload
    xhr.onload = async () => {
      const response = JSON.parse(xhr.response);

      // Build scan history entry
      const newEntry = {
        id: Date.now().toString(),
        imageUri,
        prediction: response.prediction,
        confidence: response.confidence,
        severity: response.severity,
        scores: response.scores,
        recommendations: response.recommendations,
        metadata: response.metadata,
        timestamp: new Date().toISOString(),
      };

      // Save to AsyncStorage
      const existing = await AsyncStorage.getItem("scanHistory");
      const history = existing ? JSON.parse(existing) : [];
      history.unshift(newEntry);
      await AsyncStorage.setItem("scanHistory", JSON.stringify(history));

      // Success animation -> navigate to Results
      successAnim.setValue(0);
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          navigation.navigate("Results", {
            imageUri,
            result: response,
          });
        }, 600);
      });
    };

    // Handle upload error
    xhr.onerror = () => {
      setUploading(false);
      console.log("UPLOAD ERROR");
    };

    xhr.open("POST", "http://192.168.0.93:5001/api/analysis/upload");
    xhr.send(formData);
  };


  // Uploading UI

  if (uploading) {
    return (
      <View style={styles.uploadContainer}>
        {progress < 100 ? (
          <>
            <Text style={styles.uploadTitle}>Uploading...</Text>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.progressText}>{progress}%</Text>
          </>
        ) : (
          <Animated.View
            style={[
              styles.successContainer,
              { opacity: successAnim, transform: [{ scale: successAnim }] },
            ]}
          >
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Upload Complete</Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // Main Screen

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Photo</Text>

      <View style={styles.card}>
        {/* Take a new photo */}
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        {/* Choose from gallery */}
        <TouchableOpacity style={styles.outlineButton} onPress={pickImage}>
          <Text style={styles.outlineButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        {/* Preview + Upload */}
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />

            <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: BACKGROUND,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 20,
    color: TEXT_DARK,
    textAlign: "center",
  },

  card: {
    width: "100%",
    backgroundColor: CARD_WHITE,
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },

  button: {
    width: "100%",
    backgroundColor: PRIMARY_TURQUOISE,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  outlineButton: {
    width: "100%",
    borderWidth: 2,
    borderColor: PRIMARY_TURQUOISE,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  outlineButtonText: {
    color: PRIMARY_TURQUOISE,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  image: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 20,
  },

  uploadButton: {
    width: "100%",
    backgroundColor: PRIMARY_TURQUOISE,
    paddingVertical: 14,
    borderRadius: 10,
  },

  uploadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  // Uploading UI
  uploadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND,
    paddingHorizontal: 30,
  },

  uploadTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 20,
  },

  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY_TURQUOISE,
  },

  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: TEXT_DARK,
    fontWeight: "600",
  },

  // Success animation
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  successIcon: {
    fontSize: 60,
    color: PRIMARY_TURQUOISE,
    fontWeight: "700",
  },

  successText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_DARK,
  },
});
