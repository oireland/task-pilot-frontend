"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function NotionCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get("error");

  if (error) {
    return (
      <div className="flex flex-col space-y-3">
        <h1>Error</h1>
      </div>
    );
  }

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      // Send the code to your backend to be exchanged for an access token
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notion/exchange-code`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).then((response) => {
        console.log(response);

        if (response.ok) {
          // If successful, redirect to the main app/dashboard
          router.push("/app");
        } else {
          // Handle errors, e.g., redirect to an error page
        }
      });
    }
  }, [searchParams, router]);

  return <div>Connecting to Notion, please wait...</div>;
}
