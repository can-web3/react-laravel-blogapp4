import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormInputProps = {
  name: string
  title: string
  placeholder?: string
  type?: string
  value: string
  error?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FormInput({
  name,
  title,
  placeholder,
  type = "text",
  value,
  error,
  onChange,
}: FormInputProps) {

  return (
    <div className="space-y-2">

      {/* LABEL */}
      <Label htmlFor={name}>
        {title || name}
      </Label>

      {/* INPUT */}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive/20"
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
