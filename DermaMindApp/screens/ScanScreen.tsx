import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { launchCamera } from "react-native-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScanStackParamList } from "../types/navigation";

type ScanNavProp = NativeStackNavigationProp<ScanStackParamList, "Scan">;

const PRIMARY_TURQUOISE = "#1EB5A6";
const TEXT_MUTED = "#6C757D";

export default function ScanScreen() {
  const navigation = useNavigation<ScanNavProp>();

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success animation
  const successAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for scan button
  const pulse = useRef(new Animated.Value(1)).current;

  // Reset screen every time user returns to Scan tab
  useFocusEffect(
    React.useCallback(() => {
      setUploading(false);
      setProgress(0);
      setErrorMessage(null);
      successAnim.setValue(0);
    }, [])
  );

  // Continuous pulse animation for scan button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Open camera and capture image
  const takePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: "photo",
        cameraType: "back",
        quality: 1,
        saveToPhotos: false,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        setErrorMessage(result.errorMessage || "Unable to open camera");
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      uploadImage(asset.uri);

    } catch (error: any) {
      setErrorMessage(error.message || "Unexpected error occurred.");
    }
  };

  // Upload image with progress + success animation
  const uploadImage = async (uri: string) => {
    if (uploading) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("image", {
      uri,
      type: "image/jpeg",
      name: "scan.jpg",
    } as any);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    // Handle successful upload
    xhr.onload = () => {
      const response = JSON.parse(xhr.response);

      // Trigger success animation
      successAnim.setValue(0);
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Navigate to results after animation
        setTimeout(() => {
          navigation.navigate("Results", {
            imageUri: uri,
            result: response,
          });
        }, 600);
      });
    };

    // Handle upload error
    xhr.onerror = () => {
      setUploading(false);
      setErrorMessage("Upload failed. Please try again.");
    };

    xhr.open("POST", "http://192.168.0.93:5001/api/analysis/upload");
    xhr.send(formData);
  };

  // -----------------------------
  // UPLOADING UI
  // -----------------------------
  if (uploading) {
    return (
      <View style={styles.uploadContainer}>
        {progress < 100 ? (
          <>
            <Text style={styles.uploadTitle}>Analyzing your scan…</Text>

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
            <Text style={styles.successText}>Scan Complete</Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // Error Screen

  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>

        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => setErrorMessage(null)}
        >
          <Text style={styles.errorButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // MAIN SCREEN
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scan</Text>
      <Text style={styles.subheader}>Take a photo or upload from gallery</Text>

      {/* Placeholder camera preview area */}
      <View style={styles.cameraPreview}>
        <Text style={styles.cameraText}>Camera Preview</Text>
      </View>

      {/* Scan button + Upload option */}
      <View style={styles.bottomContainer}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity style={styles.scanButton} onPress={takePhoto}>
            <View style={styles.innerScanButton} />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => navigation.navigate("UploadPhoto")}>
          <Text style={styles.uploadText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Stylesheet 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },

  subheader: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 10,
  },

  cameraPreview: {
    flex: 1,
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  cameraText: { color: "#666", fontSize: 18 },

  bottomContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },

  scanButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 6,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  innerScanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },

  uploadText: {
    color: PRIMARY_TURQUOISE,
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Upload UI
  uploadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 30,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#333",
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
    color: "#fff",
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
    color: "#fff",
  },

  // Error UI
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorTitle: { fontSize: 24, fontWeight: "700", color: "#d9534f" },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  errorButton: {
    backgroundColor: PRIMARY_TURQUOISE,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  errorButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
