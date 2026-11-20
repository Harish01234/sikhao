import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-redirect";
import { dashboardPath, isAppRole } from "@/lib/auth-role";

import { SignInForm } from "./sign-in-form";

export const instant = false;

export default async function SignInPage() {
  const session = await getAuthSession();

  if (session) {
    if (isAppRole(session.user.role)) {
      redirect(dashboardPath(session.user.role));
    }

    redirect("/sign-up");
  }

  return <SignInForm />;
}
