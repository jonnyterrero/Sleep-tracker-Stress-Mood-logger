import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { MainTabParamList, MainStackParamList } from '../types';
import { Theme } from '../constants/theme';

// Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import TrackingScreen from '../screens/main/TrackingScreen';
import InsightsScreen from '../screens/main/InsightsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Tracking Sub-screens
import SleepTrackingScreen from '../screens/tracking/SleepTrackingScreen';
import StressTrackingScreen from '../screens/tracking/StressTrackingScreen';
import MoodTrackingScreen from '../screens/tracking/MoodTrackingScreen';
import SymptomTrackingScreen from '../screens/tracking/SymptomTrackingScreen';

// Insights Sub-screens
import HealthInsightsScreen from '../screens/insights/HealthInsightsScreen';
import TrendsScreen from '../screens/insights/TrendsScreen';
import PredictionsScreen from '../screens/insights/PredictionsScreen';
import CorrelationsScreen from '../screens/insights/CorrelationsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

function TrackingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Theme.colors.background },
      }}
    >
      <Stack.Screen name="TrackingHome" component={TrackingScreen} />
      <Stack.Screen name="SleepTracking" component={SleepTrackingScreen} />
      <Stack.Screen name="StressTracking" component={StressTrackingScreen} />
      <Stack.Screen name="MoodTracking" component={MoodTrackingScreen} />
      <Stack.Screen name="SymptomTracking" component={SymptomTrackingScreen} />
    </Stack.Navigator>
  );
}

function InsightsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Theme.colors.background },
      }}
    >
      <Stack.Screen name="InsightsHome" component={InsightsScreen} />
      <Stack.Screen name="HealthInsights" component={HealthInsightsScreen} />
      <Stack.Screen name="Trends" component={TrendsScreen} />
      <Stack.Screen name="Predictions" component={PredictionsScreen} />
      <Stack.Screen name="Correlations" component={CorrelationsScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tracking':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Insights':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Theme.colors.background,
          borderTopColor: Theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingStack}
        options={{ tabBarLabel: 'Tracking' }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsStack}
        options={{ tabBarLabel: 'Insights' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

