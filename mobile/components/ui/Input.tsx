import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  className = "",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-slate-700 dark:text-slate-200 font-medium mb-2 text-sm">
          {label}
        </Text>
      )}
      <View
        className={`
          flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-xl
          border-2 px-4
          ${isFocused ? "border-primary-500" : "border-slate-200 dark:border-slate-700"}
          ${error ? "border-red-500" : ""}
        `}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? "#059669" : "#94a3b8"}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          className={`flex-1 py-4 text-base text-slate-900 dark:text-white ${className}`}
          placeholderTextColor="#94a3b8"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#94a3b8"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-1.5 ml-1">{error}</Text>
      )}
    </View>
  );
}
