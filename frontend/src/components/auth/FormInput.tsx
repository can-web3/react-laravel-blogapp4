import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Form input with pill-style radius. Forwards all native input props.
 *
 * @param id - Binds the input to a label via htmlFor. Use for accessibility.
 * @param name - Form field name (for form submission / React state).
 * @param type - Input type: "text" | "email" | "password" | "number" | "search" | etc.
 * @param placeholder - Placeholder text when the field is empty.
 * @param value - Controlled value (use with onChange).
 * @param defaultValue - Uncontrolled default value.
 * @param onChange - Called when the value changes.
 * @param onBlur - Called when the input loses focus.
 * @param disabled - When true, the input is disabled.
 * @param autoComplete - Hint for browser autocomplete: "email" | "name" | "current-password" | "new-password" | etc.
 * @param className - Extra CSS classes (merged with the default rounded style).
 * @param required - When true, the field is required for form validation.
 * @param ref - Forwarded ref to the underlying input element.
 */
const FormInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <>
      <Input
        ref={ref}
        className={cn("rounded-(--auth-input-radius)", className)}
        {...props}
      />
    </>
  );
});

export default FormInput;
