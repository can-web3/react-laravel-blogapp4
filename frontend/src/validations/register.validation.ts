import * as Yup from "yup";

export default Yup.object({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(255, "Username must be at most 255 characters")
    .trim(),

  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .max(100, "Email must be at most 100 characters")
    .trim(),

  password: Yup.string()
    .required("Password is required")
    .min(4, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
    
  confirm_password: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});
