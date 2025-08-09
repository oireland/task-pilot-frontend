"use client";

import { useMemo } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function NotionConnectPage() {
  const notionAuthUrl = process.env.NEXT_PUBLIC_NOTION_AUTH_URL!!;

  console.log(notionAuthUrl);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center md:text-2xl">
                Connect Notion to TaskPilot
              </CardTitle>
              <CardDescription>
                Authorize TaskPilot to create a new to-do list in your Notion
                workspace from the tasks extracted in your documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                You will be redirected to Notion to grant access. We request
                permission to create pages/databases needed for your tasks. You
                can revoke access at any time from your Notion settings.
              </p>
              <p className="text-sm text-gray-600">
                Please select <b>`Use a template provided by the developer`</b>{" "}
                on the second page.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 items-center justify-between">
              <Link
                href={notionAuthUrl}
                className={buttonVariants({ variant: "default" })}
              >
                Connect Notion
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="text-xs text-gray-500">
                By continuing, you agree to authorize TaskPilot to create
                content in your Notion workspace.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
