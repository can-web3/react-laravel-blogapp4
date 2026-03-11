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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "@/components/ui";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setError("Please enter a valid email");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await forgotPassword(trimmed);
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 pt-8 pb-6 justify-center">
          <View className="w-20 h-20 bg-primary-100 rounded-3xl items-center justify-center self-center mb-6">
            <Ionicons name="mail-open-outline" size={40} color="#059669" />
          </View>
          <Text className="text-xl font-bold text-slate-900 text-center mb-2">
            Check your email
          </Text>
          <Text className="text-slate-500 text-center mb-8">
            We sent a password reset link to {email.trim()}. Open the link to set a new password.
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => router.replace("/(auth)/login")}
            fullWidth
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

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
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mb-6"
            >
              <Ionicons name="arrow-back" size={22} color="#475569" />
            </TouchableOpacity>

            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-primary-100 rounded-3xl items-center justify-center mb-6">
                <Ionicons name="lock-open-outline" size={40} color="#059669" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 mb-2">
                Forgot password?
              </Text>
              <Text className="text-slate-500 text-center">
                Enter your email and we'll send you a link to reset your password.
              </Text>
            </View>

            <View className="mb-6">
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="mail-outline"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                error={error}
              />
            </View>

            <Button
              title="Send reset link"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
            />

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="mt-6 py-3 items-center"
            >
              <Text className="text-primary-600 font-medium">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
