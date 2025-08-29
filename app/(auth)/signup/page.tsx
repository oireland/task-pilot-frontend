"use client";

import type React from "react";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CircleAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Zod rules: length, digit, special character
const PasswordSchema = z
  .string()
  .min(8, { message: "Be at least 8 characters long." })
  .regex(/\d/, { message: "Contain at least one digit." })
  .regex(/[^A-Za-z0-9]/, {
    message: "Contain at least one special character.",
  });

const SignupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: PasswordSchema,
});

type SignupFormValues = z.infer<typeof SignupSchema>;
type FieldErrors = Partial<Record<keyof SignupFormValues, string>>;

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [values, setValues] = useState<SignupFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // Focus and blur tracking to control when to show field errors
  const [focused, setFocused] = useState<null | "email" | "password">(null);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    {
      email: false,
      password: false,
    }
  );

  const [showPassword, setShowPassword] = useState(false);

  // Validate and collect field-level errors (first message per field)
  const validate = (next: SignupFormValues) => {
    const parsed = SignupSchema.safeParse(next);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = parsed.error.flatten().fieldErrors;
    setErrors({
      email: fieldErrors.email?.[0],
      password: fieldErrors.password?.[0],
    });
    return false;
  };

  const handleFocus = (key: "email" | "password") => () => setFocused(key);
  const handleBlur = (key: "email" | "password") => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setFocused((prev) => (prev === key ? null : prev));
    // Validate on blur so we have up-to-date messages
    validate(values);
  };

  const updateField =
    (key: keyof SignupFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [key]: e.target.value };
      setValues(next);
      // Keep the form's validity updated, but only display errors per-field based on touched state
      validate(next);
    };

  const isValid = useMemo(
    () => SignupSchema.safeParse(values).success,
    [values]
  );

  // Password requirements list (always computed; displayed only when password is focused or touched)
  const pwRules = [
    { ok: values.password.length >= 8, label: "At least 8 characters" },
    { ok: /\d/.test(values.password), label: "At least one digit" },
    {
      ok: /[^A-Za-z0-9]/.test(values.password),
      label: "At least one special character",
    },
  ];
  const allPwOk = pwRules.every((r) => r.ok);
  const showPasswordFeedback = focused === "password" || touched.password;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(values)) {
      toast.warning("Fix form errors", {
        description: "Please correct the highlighted fields and try again.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/signup", values);

      // After successful signup, redirect to verify, but keep the plan parameters
      const plan = searchParams.get("plan");
      const interval = searchParams.get("interval");

      let redirectUrl = `/verify?email=${values.email}`;
      if (plan) {
        redirectUrl += `&plan=${plan}`;
      }
      if (interval) {
        redirectUrl += `&interval=${interval}`;
      }

      router.push(redirectUrl);
    } catch (err: any) {
      toast.error("Signup error", { description: err?.message ?? "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const emailHasError = !!errors.email && touched.email;
  const passwordHasError =
    !!errors.password && (touched.password || focused === "password");

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Sign up to try TaskPilot</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={values.email}
                onChange={updateField("email")}
                onFocus={handleFocus("email")}
                onBlur={handleBlur("email")}
                autoComplete="email"
                aria-invalid={emailHasError}
                aria-describedby={emailHasError ? "email-error" : undefined}
              />
              {emailHasError && (
                <p id="email-error" className="text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={values.password}
                  onChange={updateField("password")}
                  onFocus={handleFocus("password")}
                  onBlur={handleBlur("password")}
                  autoComplete="new-password"
                  className="pr-10"
                  aria-invalid={passwordHasError}
                  aria-describedby={
                    showPasswordFeedback
                      ? "password-rules"
                      : passwordHasError
                      ? "password-error"
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password requirements list (visible when password field is focused or has been blurred at least once) */}
              {showPasswordFeedback && (
                <div id="password-rules" className="mt-1 space-y-1">
                  {pwRules.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs ${
                        r.ok ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {r.ok ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <CircleAlert className="h-3.5 w-3.5" />
                      )}
                      <span>{r.label}</span>
                    </div>
                  ))}
                  {values.password.length > 0 && allPwOk && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Password meets all requirements.
                    </div>
                  )}
                </div>
              )}

              {/* Optional single error text (hidden when rules are shown) */}
              {!showPasswordFeedback && passwordHasError && (
                <p id="password-error" className="text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500">
              We’ll securely process your credentials.
            </p>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-sm text-gray-600">
            <span className="mr-2">Already have an account?</span>
            <Link href="/login" className="text-emerald-700 hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
