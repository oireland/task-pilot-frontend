import { Suspense } from "react";
import NotionCallbackClient from "./callback-client";
import { Loader2 } from "lucide-react";

// This is now a Server Component
export default function NotionCallbackPage() {
  return (
    // Suspense provides a fallback while the client component loads
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <NotionCallbackClient />
    </Suspense>
  );
}
