import { UserProvider } from "@/components/user-provider";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  generator: "v0.dev",
};
