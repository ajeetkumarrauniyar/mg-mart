import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { AppNavigator } from './navigation';
import { useAppInitialization } from './hooks';
import { initializeDebugging } from './config/debugger';

export default function App() {
  const { isInitialized, initError } = useAppInitialization();

  // Initialize debugging tools
  useEffect(() => {
    initializeDebugging();
  }, []);

  // Show loading screen while app is initializing
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#48bb78" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#4a5568' }}>
          Loading MG-MART...
        </Text>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#e53e3e', textAlign: 'center', marginBottom: 16 }}>
          Failed to initialize app
        </Text>
        <Text style={{ fontSize: 14, color: '#4a5568', textAlign: 'center' }}>
          {initError}
        </Text>
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
