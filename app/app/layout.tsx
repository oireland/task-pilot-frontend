import AuthGuard from "@/components/auth-guard";
import { Navbar } from "@/components/navbar"; // Your app's main navigation bar

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
