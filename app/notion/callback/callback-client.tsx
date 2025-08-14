"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Spinner } from "@/components/spinner";
import { api } from "@/lib/api";

export default function NotionCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestMadeRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(searchParams.get("error"));

  useEffect(() => {
    if (requestMadeRef.current) {
      return;
    }
    requestMadeRef.current = true;

    const code = searchParams.get("code");

    if (error) {
      setIsLoading(false);
      return;
    }

    if (code) {
      api
        .post("/api/v1/notion/exchange-code", { code })
        .then(() => {
          // THE FIX: If this block is reached, the request was successful.
          // We can directly redirect the user.
          router.push("/app/settings");
        })
        .catch((err: Error) => {
          // The .catch() block will handle any network or API errors.
          setError(err.message || "Failed to connect to the server.");
          setIsLoading(false);
        });
    } else {
      setError("Authorization code not found.");
      setIsLoading(false);
    }
  }, [searchParams, router, error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            {error ? "Connection Failed" : "Connecting to Notion"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          {isLoading && (
            <>
              <Spinner className="h-12 w-12 text-blue-600" />
              <p className="text-gray-600">
                Please wait while we connect your Notion account...
              </p>
            </>
          )}
          {error && (
            <>
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="text-red-600">
                {error === "access_denied"
                  ? "You have denied access to your Notion account."
                  : `An error occurred: ${error}`}
              </p>
              <Button onClick={() => router.push("/app/settings")}>
                Return to Settings
              </Button>
            </>
          )}
          {!isLoading && !error && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-gray-600">
                Successfully connected! Redirecting...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
