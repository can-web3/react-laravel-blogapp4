import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui";
import { getToken, getUser, clearAll } from "@/lib/storage";
import type { User } from "@/lib/types";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        const userData = await getUser<User>();
        setUser(userData);
        setIsGuest(false);
      } else {
        setIsGuest(true);
      }
    } catch (err) {
      console.error("Error checking auth:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await clearAll();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-6 border-b border-slate-100">
        <Text className="text-2xl font-bold text-slate-900 mb-6">Profile</Text>

        {/* Profile Card */}
        <View className="items-center">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
            {isGuest ? (
              <Ionicons name="person-outline" size={40} color="#3b82f6" />
            ) : (
              <Text className="text-primary-600 font-bold text-3xl">
                {user?.name?.charAt(0) || "U"}
              </Text>
            )}
          </View>
          
          {isGuest ? (
            <>
              <Text className="text-xl font-bold text-slate-900 mb-1">Guest User</Text>
              <Text className="text-slate-500 text-center mb-4">
                Sign in to access all features
              </Text>
              <Button
                title="Sign In"
                onPress={handleLogin}
                size="md"
              />
            </>
          ) : (
            <>
              <Text className="text-xl font-bold text-slate-900 mb-1">
                {user?.name || "User"}
              </Text>
              <Text className="text-slate-500">{user?.email}</Text>
            </>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <View className="flex-1 p-5">
        {!isGuest && (
          <>
            <MenuItem
              icon="bookmark-outline"
              title="Saved Posts"
              onPress={() => router.push({ pathname: "/profile/blogs", params: { list: "saved" } })}
            />
            <MenuItem
              icon="heart-outline"
              title="Liked Posts"
              onPress={() => router.push({ pathname: "/profile/blogs", params: { list: "liked" } })}
            />
            <MenuItem
              icon="create-outline"
              title="My Posts"
              onPress={() => router.push({ pathname: "/profile/blogs", params: { list: "my" } })}
            />
            <View className="h-px bg-slate-200 my-3" />
            <MenuItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleLogout}
              danger
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, title, onPress, danger = false }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4"
      activeOpacity={0.7}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center ${danger ? "bg-red-50" : "bg-slate-100"}`}>
        <Ionicons name={icon} size={22} color={danger ? "#ef4444" : "#475569"} />
      </View>
      <Text className={`flex-1 ml-3 font-medium text-base ${danger ? "text-red-500" : "text-slate-700"}`}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );
}
