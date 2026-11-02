import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Text } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import MenuScreen from "../screens/MenuScreen";
import CartScreen from "../screens/CartScreen";
import OrderTrackingScreen from "../screens/OrderTrackingScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0d6efd",
        tabBarInactiveTintColor: "#6c757d",
        tabBarStyle: {
          paddingVertical: 6,
          height: 60,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#dee2e6"
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 6
        }
      }}
    >
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarLabel: "Thực Đơn",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 13, fontWeight: "bold" }}>[MENU]</Text>
          )
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: "Giỏ Hàng",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 13, fontWeight: "bold" }}>[GIỎ]</Text>
          )
        }}
      />
      <Tab.Screen
        name="TrackingTab"
        component={OrderTrackingScreen}
        options={{
          tabBarLabel: "Tiến Độ",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 13, fontWeight: "bold" }}>[ĐƠN]</Text>
          )
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={OrderHistoryScreen}
        options={{
          tabBarLabel: "Lịch Sử",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 13, fontWeight: "bold" }}>[LỊCH SỬ]</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
