import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNavigator } from './navigation';
import { useAppInitialization } from './hooks';
import { initializeDebugging } from './config/debugger';
import { SplashScreen, OnboardingScreen } from './screens';

const ONBOARDING_KEY = '@mg_mart_onboarding_complete';

export default function App() {
  const { isInitialized, initError } = useAppInitialization();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  // Initialize debugging tools
  useEffect(() => {
    initializeDebugging();
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(value === null);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  // Show splash screen
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  // Show onboarding if not completed
  if (showOnboarding === null) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#48bb78" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  // Show loading screen while app is initializing
  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#48bb78" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#4a5568' }}>
            Loading MG-MART...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#e53e3e', textAlign: 'center', marginBottom: 16 }}>
            Failed to initialize app
          </Text>
          <Text style={{ fontSize: 14, color: '#4a5568', textAlign: 'center' }}>
            {initError}
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Navigation handles auth flow now
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
