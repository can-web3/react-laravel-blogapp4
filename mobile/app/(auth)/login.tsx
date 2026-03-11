import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "@/components/ui";
import { login } from "@/lib/auth";
import type { ApiError } from "@/lib/types";
import { AxiosError } from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await login({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || "Login failed. Please try again.";
      
      if (axiosError.response?.data?.errors) {
        const apiErrors = axiosError.response.data.errors;
        setErrors({
          email: apiErrors.email?.[0],
          password: apiErrors.password?.[0],
        });
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-8 pb-6">
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-primary-100 rounded-3xl items-center justify-center mb-6">
                <Ionicons name="newspaper-outline" size={40} color="#059669" />
              </View>
              <Text className="text-3xl font-bold text-slate-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-base text-slate-500 text-center">
                Sign in to continue to your account
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-5">
              <View className="mb-4">
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                />
              </View>

              <View className="mb-6">
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  leftIcon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />
              </View>

              <TouchableOpacity
                className="self-end mb-6"
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text className="text-primary-600 font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="lg"
              />

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="mx-4 text-slate-400 text-sm">or</Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>

              <Button
                title="Continue as Guest"
                variant="outline"
                onPress={() => router.replace("/(tabs)")}
                fullWidth
                size="lg"
              />
            </View>

            {/* Footer */}
            <View className="flex-row justify-center items-center mt-auto pt-8">
              <Text className="text-slate-500 text-base">
                Don't have an account?{" "}
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-semibold text-base">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
