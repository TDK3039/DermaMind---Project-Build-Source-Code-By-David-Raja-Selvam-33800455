import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import HomeScreen from "./screens/HomeScreen";
import ScanScreen from "./screens/ScanScreen";
import UploadPhoto from "./screens/UploadPhoto";
import LogScreen from "./screens/LogScreen";
import InsightsScreen from "./screens/InsightsScreen";
import LearnScreen from "./screens/LearnScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ResultsScreen from "./screens/ResultsScreen";
import LearnDetailScreen from "./screens/LearnDetailScreen";
import AboutScreen from "./screens/AboutScreen";
import PrivacyScreen from "./screens/PrivacyScreen";
import TermsScreen from "./screens/TermsScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import EditProfileScreen from "./screens/EditProfileScreen";

const RootStack = createNativeStackNavigator();
const ScanStack = createNativeStackNavigator();
const LearnStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Scan Stack

function ScanStackNavigator() {
  return (
    <ScanStack.Navigator>
      <ScanStack.Screen name="Scan" component={ScanScreen} />
      <ScanStack.Screen name="UploadPhoto" component={UploadPhoto} />
      <ScanStack.Screen name="Results" component={ResultsScreen} />
    </ScanStack.Navigator>
  );
}

// Learn Stack

function LearnStackNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="Learn" component={LearnScreen} />
      <LearnStack.Screen
        name="LearnDetail"
        component={LearnDetailScreen}
        options={{ headerShown: true, title: "" }}
      />
    </LearnStack.Navigator>
  );
}


// Profile Stack

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="Privacy" component={PrivacyScreen} />
      <ProfileStack.Screen name="Terms" component={TermsScreen} />
    </ProfileStack.Navigator>
  );
}

// Tabs

function Tabs() {
  const icons: Record<string, string> = {
    Home: "home",
    Scan: "camera",
    Log: "list",
    Insights: "bar-chart-2",
    Learn: "book-open",
    Profile: "user",
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1EB5A6",
        tabBarInactiveTintColor: "#6C757D",
        tabBarIcon: ({ color, size }) => (
          <Feather name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanStackNavigator} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Learn" component={LearnStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

// Root app with Login Flow

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const value = await AsyncStorage.getItem("isLoggedIn");
      setLoggedIn(value === "true");
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {/* Always registered */}
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Signup" component={SignupScreen} />
          <RootStack.Screen name="Tabs" component={Tabs} />
          <RootStack.Screen name="Results" component={ResultsScreen} />

          {/* Redirect logic */}
          {loggedIn ? (
            <RootStack.Screen name="RedirectTabs">
              {() => <Tabs />}
            </RootStack.Screen>
          ) : (
            <RootStack.Screen name="RedirectLogin">
              {() => <LoginScreen />}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

