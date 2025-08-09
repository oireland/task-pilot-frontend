import { UserProvider } from "@/components/user-provider";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <UserProvider>
            <Navbar />
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "TaskPilot",
  description: "Turn documents into actionable Notion to‑dos",
};
