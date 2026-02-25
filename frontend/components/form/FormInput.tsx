import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormInputProps = {
  name: string
  label: string
  placeholder?: string
  type?: string
  autoComplete?: string
  value: string
  error?: string
  touched?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
}

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FormInputProps) {

  const showError = touched && error

  return (
    <div className="space-y-2">

      {/* LABEL */}
      <Label htmlFor={name}>
        {label}
      </Label>

      {/* INPUT */}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!showError}
        className={cn(
          showError && "border-destructive focus-visible:ring-destructive/20"
        )}
      />

      {/* ERROR */}
      {error && (
        <p
          className="text-destructive text-xs"
          role="alert"
        >
          {error}
        </p>
      )}

    </div>
  )
}
