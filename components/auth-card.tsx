"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, CircleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: string
  submitLabel: string
  altAction: { href: string; label: string }
  onSubmit: (values: { email: string; password: string }) => Promise<void>
  // Return an array of error messages for each failing password rule
  validatePassword?: (password: string) => string[]
  // Return true if the form (email+password) is valid
  validateForm?: (values: { email: string; password: string }) => boolean
}

export function AuthCard({ title, subtitle, submitLabel, altAction, onSubmit, validatePassword, validateForm }: Props) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // Recompute password errors as the user types if a validator is provided
  useEffect(() => {
    if (!validatePassword) return
    setPasswordErrors(validatePassword(password))
  }, [password, validatePassword])

  const allPasswordRulesPass = useMemo(
    () => (validatePassword ? passwordErrors.length === 0 && password.length > 0 : true),
    [passwordErrors, password, validatePassword],
  )

  const isFormValid = useMemo(() => {
    if (validateForm) return validateForm({ email, password })
    if (validatePassword) return allPasswordRulesPass && email.length > 0
    return email.length > 0 && password.length > 0
  }, [validateForm, validatePassword, allPasswordRulesPass, email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      toast({
        title: "Fix form errors",
        description: "Please satisfy the form requirements before continuing.",
      })
      return
    }

    setLoading(true)
    try {
      await onSubmit({ email, password })
    } catch (e: any) {
      toast({ title: "Action failed", description: e?.message ?? "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={validatePassword ? "password-rules" : undefined}
                autoComplete="new-password"
              />
              {validatePassword && (
                <div id="password-rules" className="mt-2">
                  {password.length === 0 ? (
                    <div className="text-xs text-gray-500">
                      Enter a password and we’ll show which requirements are unmet.
                    </div>
                  ) : allPasswordRulesPass ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Password meets all requirements.
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {passwordErrors.map((msg, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{msg}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              {validatePassword
                ? "Passwords must satisfy the requirements shown below."
                : "We'll securely process your credentials."}
            </p>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-sm text-gray-600">
            <span className="mr-2">Want something else?</span>
            <Link href={altAction.href} className={cn("text-emerald-700 hover:underline")}>
              {altAction.label}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
