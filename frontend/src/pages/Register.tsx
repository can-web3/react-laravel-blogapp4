import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import EmailDivider from "@/components/auth/EmailDivider";
import { useFormik } from "formik";
import registerValidation from "@/validations/register.validation";
import { axiosGuest } from "@/lib/axiosGuest";
import { toast } from "react-toastify";
import { PageSEO } from "@/components/PageSEO";

const benefits = [
  {
    icon: BookOpen,
    title: "Read & discover",
    text: "Access articles and guides from the community.",
  },
  {
    icon: Sparkles,
    title: "Save & organize",
    text: "Bookmark posts and follow your favorite topics.",
  },
  {
    icon: Users,
    title: "Join the community",
    text: "Comment, share, and connect with other readers.",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    errors,
    handleChange,
    handleBlur,
    values,
    setErrors,
    isSubmitting,
  } = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: registerValidation,
    validateOnChange: false,
    onSubmit: async (values: {
      username: string;
      email: string;
      password: string;
      confirm_password: string;
    }) => {
      try {
        const res = await axiosGuest.post("/auth/register", { ...values });
        if(res.status === 201) {
          toast.success("Account created successfully");
          navigate("/login");
        } else {
          toast.error("Failed to create account");
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
        console.log(e.response?.data ?? err);
        const errors = e.response?.data?.errors;
        if (errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])
            )
          );
        }
      }
    },
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] md:min-h-screen">
      <PageSEO title="Create account" noindex />
      <div className="grid min-h-[calc(100vh-4rem)] md:min-h-screen lg:grid-cols-2">
        {/* Form panel: first on small screens, right on lg */}
        <div
          className="order-1 flex flex-col justify-center lg:order-2 px-(--auth-panel-padding-inline) py-(--auth-panel-padding-block) lg:px-(--auth-panel-padding-inline-lg) lg:py-(--auth-panel-padding-block-lg)"
        >
          <div
            className="mx-auto w-full"
            style={{ maxWidth: "var(--auth-form-max-width)" }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Create account
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Login
              </Link>
            </p>

            <div className="mt-8">
              <GoogleSignInButton />

              <EmailDivider />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Your username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                        errors.username &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.username && (
                    <p className="text-destructive text-xs" role="alert">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                    value={values.password}
                    onChange={handleChange}
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

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="Confirm your password"
                    value={values.confirm_password}
                    onChange={handleChange}
                    className={cn(
                        errors.confirm_password &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.confirm_password && (
                    <p className="text-destructive text-xs" role="alert">
                      {errors.confirm_password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-(--auth-input-radius)"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Content panel: second on small screens, left on lg */}
        <div
          className={cn(
            "order-2 relative flex flex-col justify-center bg-primary text-primary-foreground lg:order-1 px-(--auth-panel-padding-inline) py-(--auth-panel-padding-block) lg:px-(--auth-panel-padding-inline-lg) lg:py-(--auth-panel-padding-block-lg)"
          )}
        >
          <div
            className="mx-auto w-full"
            style={{ maxWidth: "var(--auth-content-max-width)" }}
          >
            <h1 className="mt-10 text-3xl font-bold tracking-tight sm:text-4xl">
              Join BlogApp today
            </h1>
            <p className="mt-4 text-primary-foreground/85 text-lg">
              Create a free account and start reading, saving, and sharing
              stories that matter to you.
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
