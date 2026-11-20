import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-redirect";
import { dashboardPath, isAppRole } from "@/lib/auth-role";

import { RoleDialog } from "./role-dialog";
import { SignUpForm } from "./sign-up-form";

export const instant = false;

export default async function SignUpPage() {
  const session = await getAuthSession();

  if (session && isAppRole(session.user.role)) {
    redirect(dashboardPath(session.user.role));
  }

  return (
    <>
      <SignUpForm />
      {session ? <RoleDialog /> : null}
    </>
  );
}
