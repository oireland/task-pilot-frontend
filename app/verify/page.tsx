import { redirect } from "next/navigation";
import VerifyForm from "@/components/verify-form"; // Your client component

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams before using
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : "";

  console.log(`email is ${email}`);

  // 2. Only perform the server-side check if an email was provided in the URL.
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
    } catch (error) {
      console.error("Failed to fetch user status:", error);
    }
    if (userEnabled) {
      redirect("/login");
    }
  }

  // 3. Always render the form, passing the email (which may be empty).
  return <VerifyForm initialEmail={email} />;
}
