import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import EmailDivider from "@/components/auth/EmailDivider";
import { useFormik } from "formik";
import loginValidation from "@/validations/login.validation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { PageSEO } from "@/components/PageSEO";

const benefits = [
  {
    icon: BookOpen,
    title: "Your reading list",
    text: "All your saved articles in one place.",
  },
  {
    icon: Bookmark,
    title: "Pick up where you left off",
    text: "Continue reading across devices.",
  },
  {
    icon: User,
    title: "Personalized experience",
    text: "Recommendations and preferences synced.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    handleSubmit,
    errors,
    touched,
    handleChange,
    handleBlur,
    values,
    setErrors,
    isSubmitting,
  } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidation,
    validateOnChange: false,
    onSubmit: async (values: { email: string; password: string }) => {
      const result = await login(values);
      if (result.success) {
        toast.success("Signed in successfully");
        navigate("/");
        return;
      }
      if (result.errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(result.errors).map(([k, v]) => [
              k,
              Array.isArray(v) ? v[0] : String(v),
            ])
          )
        );
      }
      if (result.message) {
        toast.error(result.message);
      }
    },
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] md:min-h-screen">
      <PageSEO title="Sign in" noindex />
      <div className="grid min-h-[calc(100vh-4rem)] md:min-h-screen lg:grid-cols-2">
        {/* Form panel: first on small screens, left on lg */}
        <div
          className="order-1 flex flex-col justify-center lg:order-1 px-(--auth-panel-padding-inline) py-(--auth-panel-padding-block) lg:px-(--auth-panel-padding-inline-lg) lg:py-(--auth-panel-padding-block-lg)"
        >
          <div
            className="mx-auto w-full"
            style={{ maxWidth: "var(--auth-form-max-width)" }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Register
              </Link>
            </p>

            <div className="mt-8">
              <GoogleSignInButton />

              <EmailDivider />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!(touched.email && errors.email)}
                    className={cn(
                      errors.email &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Your password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!(touched.password && errors.password)}
                    className={cn(
                      errors.password &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-muted-foreground text-sm hover:text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-(--auth-input-radius)"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Content panel: second on small screens, right on lg */}
        <div
          className={cn(
            "order-2 relative flex flex-col justify-center bg-primary text-primary-foreground lg:order-2 px-(--auth-panel-padding-inline) py-(--auth-panel-padding-block) lg:px-(--auth-panel-padding-inline-lg) lg:py-(--auth-panel-padding-block-lg)"
          )}
        >
          <div
            className="mx-auto w-full"
            style={{ maxWidth: "var(--auth-content-max-width)" }}
          >
            <h1 className="mt-10 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-4 text-primary-foreground/85 text-lg">
              Sign in to access your saved reads, follow topics, and join the
              community.
            </p>
            <ul className="mt-10 flex flex-col gap-(--auth-benefit-list-gap)">
              {benefits.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span
                    className="flex shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15"
                    style={{
                      width: "var(--auth-benefit-icon-size)",
                      height: "var(--auth-benefit-icon-size)",
                    }}
                    aria-hidden
                  >
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-primary-foreground/80 text-sm">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
