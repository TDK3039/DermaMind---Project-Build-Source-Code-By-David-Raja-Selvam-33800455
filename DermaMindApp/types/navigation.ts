// Root Stack (Global)
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tabs: undefined;

  // Optional Welcome screen (remove if not used)
  Welcome?: undefined;

  // Global Results screen
  Results: {
    imageUri: string;
    result: {
      prediction: string;
      confidence: string;
      severity: string;
      scores: {
        brightness: number;
        rednessIndex: number;
        textureRoughness: number;
        inflammationIndex: number;
        darkSpotsDetected: boolean;
      };
      recommendations: string[];
      metadata: {
        filename: string;
        size: number;
        analyzedAt: string;
      };
    };
    fromLog?: boolean;
  };
};


// Tabs

export type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Log: undefined;
  Insights: undefined;
  Learn: undefined;
  Profile: undefined;
};

// Scan Stack

export type ScanStackParamList = {
  Scan: undefined;

  // UploadPhoto now accepts optional imageUri
  UploadPhoto: {
    imageUri?: string;
  } | undefined;

  // Results requires imageUri + result
  Results: {
    imageUri: string;
    result: any;
    fromLog?: boolean;
  };
};


// Learn Stack
export type LearnStackParamList = {
  Learn: undefined;
  LearnDetail: {
    title: string;
    image: string;
  };
};

