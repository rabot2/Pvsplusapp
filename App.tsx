import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppContextProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Colors, FontSize, FontWeight } from './src/theme/bundesdesign';
import { RootTabParamList } from './src/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bundesblau,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.semibold,
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';
          if (route.name === 'Buchung') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Verlauf') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Einstellungen') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Buchung" component={HomeScreen} />
      <Tab.Screen name="Verlauf" component={HistoryScreen} />
      <Tab.Screen name="Einstellungen" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContextProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={Colors.bundesblau} />
          <TabNavigator />
        </NavigationContainer>
      </AppContextProvider>
    </SafeAreaProvider>
  );
}
