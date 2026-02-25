import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PageSEO } from "@/components/PageSEO";

export default function ForgotPassword() {
  return (
    <main className="min-h-[calc(100vh-4rem)] md:min-h-screen">
      <PageSEO title="Forgot password" noindex />
      <div className="grid min-h-[calc(100vh-4rem)] md:min-h-screen lg:grid-cols-2">
        <div
          className="order-1 flex flex-col justify-center lg:order-1 px-(--auth-panel-padding-inline) py-(--auth-panel-padding-block) lg:px-(--auth-panel-padding-inline-lg) lg:py-(--auth-panel-padding-block-lg)"
        >
          <div
            className="mx-auto w-full"
            style={{ maxWidth: "var(--auth-form-max-width)" }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Forgot password?
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>

            <form className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-(--auth-input-radius)"
                size="lg"
              >
                Send reset link
              </Button>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div
          className={cn(
            "order-2 relative flex flex-col justify-center bg-primary text-primary-foreground lg:order-2 px-(--auth-panel-padding-inline) py-(--auth-panel-padding-block) lg:px-(--auth-panel-padding-inline-lg) lg:py-(--auth-panel-padding-block-lg)"
          )}
        >
          <div
            className="mx-auto w-full"
            style={{ maxWidth: "var(--auth-content-max-width)" }}
          >
            <span
              className="flex shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15"
              style={{
                width: "var(--auth-benefit-icon-size)",
                height: "var(--auth-benefit-icon-size)",
              }}
              aria-hidden
            >
              <ShieldCheck className="size-8" />
            </span>
            <h1 className="mt-10 text-3xl font-bold tracking-tight sm:text-4xl">
              Reset your password
            </h1>
            <p className="mt-4 text-primary-foreground/85 text-lg">
              We&apos;ll send a secure link to your email. Use it to set a new
              password and sign back in.
            </p>
            <p className="mt-6 text-primary-foreground/75 text-sm">
              Didn&apos;t get the email? Check spam or{" "}
              <Link
                to="/forgot-password"
                className="font-medium underline underline-offset-2 hover:no-underline"
              >
                try again
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
