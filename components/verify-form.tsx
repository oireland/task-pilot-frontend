"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
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
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

// Zod schema for verification form
const VerifySchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  verificationCode: z
    .string()
    .regex(/^\d{6}$/, { message: "Enter the 6-digit code from your email." }),
});

type VerifyFormValues = z.infer<typeof VerifySchema>;
type FieldErrors = Partial<Record<keyof VerifyFormValues, string>>;

const RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export default function VerifyPage({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useUser();

  const [values, setValues] = useState<VerifyFormValues>({
    email: initialEmail,
    verificationCode: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendUntil, setResendUntil] = useState<number | null>(null);

  // Tick every second to keep countdown fresh
  useEffect(() => {
    if (!resendUntil) return;
    const id = setInterval(() => {
      setResendUntil((prev) => prev ?? null);
    }, 1000);
    return () => clearInterval(id);
  }, [resendUntil]);

  const secondsLeft = useMemo(() => {
    if (!resendUntil) return 0;
    const diff = Math.max(0, resendUntil - Date.now());
    return Math.ceil(diff / 1000);
  }, [resendUntil]);

  // Validate on every change to show inline messages
  const validate = (next: VerifyFormValues) => {
    const parsed = VerifySchema.safeParse(next);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = parsed.error.flatten().fieldErrors;
    setErrors({
      email: fieldErrors.email?.[0],
      verificationCode: fieldErrors.verificationCode?.[0],
    });
    return false;
  };

  const updateField =
    (key: keyof VerifyFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const next: VerifyFormValues =
        key === "verificationCode"
          ? { ...values, [key]: raw.replace(/\D/g, "").slice(0, 6) }
          : { ...values, [key]: raw };
      setValues(next);
      validate(next);
    };

  const isValid = VerifySchema.safeParse(values).success;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(values)) {
      toast({
        title: "Fix form errors",
        description: "Please correct the highlighted fields and try again.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        }
      );

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore non-JSON
      }

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `Verification failed (${res.status})`
        );
      }

      const { token } = await res.json();
      login(token); // Use the new login function from the hook

      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
      router.push("/app");
    } catch (err: any) {
      toast({
        title: "Verification error",
        description: err?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!values.email) {
      setErrors((e) => ({ ...e, email: "Please enter your email address." }));
      toast({
        title: "Enter email",
        description: "Please enter your email to resend the code.",
      });
      return;
    }

    if (secondsLeft > 0) {
      toast({
        title: "Please wait",
        description: `You can resend a code in ${secondsLeft}s.`,
      });
      return;
    }

    setResending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify/resend?email=${values.email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        const msg =
          data?.message || data?.error || `Resend failed (${res.status})`;
        throw new Error(msg);
      }

      const until = Date.now() + RESEND_COOLDOWN_MS;
      setResendUntil(until);
      localStorage.setItem(cooldownKey(values.email), String(until));

      toast({
        title: "Code sent",
        description: "A new verification code has been emailed to you.",
      });
    } catch (err: any) {
      toast({
        title: "Resend error",
        description: err?.message ?? "Unknown error",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            Enter the email and 6‑digit code sent to your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={values.email}
                onChange={updateField("email")}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification code</Label>
              <Input
                id="verificationCode"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                required
                value={values.verificationCode}
                onChange={updateField("verificationCode")}
                aria-invalid={!!errors.verificationCode}
                aria-describedby={
                  errors.verificationCode
                    ? "verificationCode-error"
                    : "verificationCode-help"
                }
              />
              {!errors.verificationCode ? (
                <p id="verificationCode-help" className="text-xs text-gray-500">
                  Enter the 6‑digit code.
                </p>
              ) : (
                <p id="verificationCode-error" className="text-xs text-red-600">
                  {errors.verificationCode}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify email"
              )}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {secondsLeft > 0
                ? `You can resend a code in ${secondsLeft}s`
                : "You can request a new code now"}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resending || secondsLeft > 0 || !values.email}
              className="gap-1.5"
            >
              {resending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" /> Resend code
                </>
              )}
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="text-sm text-gray-600">
            <span className="mr-2">Already verified?</span>
            <Link href="/login" className="text-emerald-700 hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cooldownKey(email: string) {
  return `taskpilot_resend_until:${email.toLowerCase()}`;
}
