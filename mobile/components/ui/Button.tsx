import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: "bg-primary-600 active:bg-primary-700",
  secondary: "bg-slate-600 active:bg-slate-700",
  outline: "bg-transparent border-2 border-primary-600",
  ghost: "bg-transparent",
};

const variantTextStyles = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-primary-600",
  ghost: "text-primary-600",
};

const sizeStyles = {
  sm: "py-2 px-4",
  md: "py-3 px-6",
  lg: "py-4 px-8",
};

const sizeTextStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        rounded-xl items-center justify-center flex-row
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : ""}
        ${className}
      `}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "secondary" ? "#fff" : "#059669"}
          className="mr-2"
        />
      )}
      <Text
        className={`
          font-semibold
          ${variantTextStyles[variant]}
          ${sizeTextStyles[size]}
        `}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
