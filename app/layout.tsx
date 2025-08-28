import { UserProvider } from "@/hooks/use-user";
import { ThemeProvider } from "@/components/theme-provider";
import "../styles/globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

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

export const metadata = {
  title: "TaskPilot",
  description: "Turn documents into actionable Notion to‑dos",
  icons: {
    icon: "/favicon.ico",
  },
};
