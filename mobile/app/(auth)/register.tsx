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
import { register } from "@/lib/auth";
import type { ApiError } from "@/lib/types";
import { AxiosError } from "axios";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!passwordConfirmation) {
      newErrors.passwordConfirmation = "Please confirm your password";
    } else if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      router.replace("/(tabs)");
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || "Registration failed. Please try again.";

      if (axiosError.response?.data?.errors) {
        const apiErrors = axiosError.response.data.errors;
        setErrors({
          name: apiErrors.name?.[0],
          email: apiErrors.email?.[0],
          password: apiErrors.password?.[0],
          passwordConfirmation: apiErrors.password_confirmation?.[0],
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
          <View className="flex-1 px-6 pt-6 pb-6">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-slate-100 rounded-xl items-center justify-center mb-6"
            >
              <Ionicons name="arrow-back" size={22} color="#475569" />
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-slate-900 mb-2">
                Create Account
              </Text>
              <Text className="text-base text-slate-500">
                Fill in your details to get started
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View className="mb-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  leftIcon="person-outline"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                />
              </View>

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

              <View className="mb-4">
                <Input
                  label="Password"
                  placeholder="Create a password"
                  isPassword
                  leftIcon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />
              </View>

              <View className="mb-6">
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  isPassword
                  leftIcon="shield-checkmark-outline"
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  error={errors.passwordConfirmation}
                />
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
              />
            </View>

            {/* Terms */}
            <View className="mt-6 px-4">
              <Text className="text-center text-slate-500 text-sm leading-5">
                By signing up, you agree to our{" "}
                <Text className="text-primary-600 font-medium">Terms of Service</Text>
                {" "}and{" "}
                <Text className="text-primary-600 font-medium">Privacy Policy</Text>
              </Text>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center items-center mt-auto pt-6">
              <Text className="text-slate-500 text-base">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-semibold text-base">
                    Sign In
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
