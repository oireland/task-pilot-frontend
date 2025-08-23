import { redirect } from "next/navigation";
import VerifyForm from "@/app/(auth)/verify/verify-form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const email =
    typeof searchParams?.email === "string" ? searchParams.email : "";
  const plan =
    typeof searchParams?.plan === "string" ? searchParams.plan : undefined;
  const interval =
    typeof searchParams?.interval === "string"
      ? searchParams.interval
      : undefined;

  // This server-side check can remain to redirect already-verified users
  if (email) {
    let userEnabled = false;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/enabled/${email}`,
        { cache: "no-store" }
      );
      if (response.ok) {
        const userData = await response.json();
        userEnabled = userData.enabled;
      }
    } catch (error) {}
    if (userEnabled) {
      redirect("/login");
    }
  }

  // Pass all necessary props to the client component
  return <VerifyForm initialEmail={email} plan={plan} interval={interval} />;
}
