import * as Yup from "yup";

export default Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .max(255, "Email must be at most 255 characters")
    .trim(),

  password: Yup.string()
    .required("Password is required")
    .min(4, "Password must be at least 4 characters")
    .max(255, "Password must be at most 255 characters"),
});
