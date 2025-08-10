"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

// Zod schema: validate email only; password just required by presence
const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string(),
});

type LoginFormValues = z.infer<typeof LoginSchema>;
type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUser();
  const searchParams = useSearchParams(); // Get search params

  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // Focus/blur tracking to control when to show field errors
  const [focused, setFocused] = useState<null | "email" | "password">(null);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    {
      email: false,
      password: false,
    }
  );
  const [showPassword, setShowPassword] = useState(false);

  const validate = (next: LoginFormValues) => {
    const parsed = LoginSchema.safeParse(next);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = parsed.error.flatten().fieldErrors;
    setErrors({
      email: fieldErrors.email?.[0],
    });
    return false;
  };

  const handleFocus = (key: "email" | "password") => () => setFocused(key);
  const handleBlur = (key: "email" | "password") => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setFocused((prev) => (prev === key ? null : prev));
    validate(values);
  };

  const updateField =
    (key: keyof LoginFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [key]: e.target.value };
      setValues(next);
      validate(next);
    };

  const emailValid = useMemo(
    () => z.string().email().safeParse(values.email).success,
    [values.email]
  );
  const canSubmit = useMemo(
    () => emailValid && values.password.length > 0,
    [emailValid, values.password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(values) || !canSubmit) {
      toast({
        title: "Fix form errors",
        description: "Please correct the highlighted fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        }
      );

      // --- IMPROVED ERROR HANDLING ---
      if (!res.ok) {
        // If it's a 401, it's bad credentials.
        if (res.status === 401) {
          setErrors({
            password: "The email or password you entered is incorrect.",
          });
          toast({
            title: "Login Failed",
            description: "Please check your credentials and try again.",
            variant: "destructive",
          });
        } else {
          // For all other server errors, show a generic message.
          const errorData = await res.json().catch(() => null);
          const message =
            errorData?.message ||
            `An unexpected error occurred (${res.status}).`;
          toast({
            title: "Login Error",
            description: message,
            variant: "destructive",
          });
        }
        // Throw an error to stop execution and go to the finally block.
        throw new Error("Login failed");
      }

      const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!meRes.ok) {
        throw new Error(`Failed to load user (${meRes.status})`);
      }
      const me = await meRes.json();

      setUser(me);

      const from = searchParams.get("from");
      if (from && from.startsWith("/")) {
        router.push(from);
      } else {
        router.push("/app");
      }
    } catch (err: any) {
      // The toast is now handled inside the try block for more specific messages.
      // We catch the error here just to stop the process.
      console.error("Login process failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const emailHasError = !!errors.email && touched.email;

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to TaskPilot</CardDescription>
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
                  autoComplete="current-password"
                  className="pr-10"
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
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={loading || !canSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-sm text-gray-600">
            <span className="mr-2">New here?</span>
            <Link href="/signup" className="text-emerald-700 hover:underline">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
