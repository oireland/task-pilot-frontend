import { UserProvider } from "@/hooks/use-user";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background">
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          attribute="class"
        >
          <UserProvider>
            <Navbar />
            {children}
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "TaskPilot",
  description: "Turn documents into actionable Notion to‑dos",
  icons: {
    icon: "/favicon.ico",
  },
};
