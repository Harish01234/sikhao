import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth-redirect";

import { listUsers } from "./actions";
import { UsersTable } from "./users-table";

export const instant = false;

export default async function AdminUsersPage() {
  const session = await getAuthSession();
  const result = await listUsers();

  return (
    <div className="bg-background px-4 py-6 text-foreground">
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
          <CardDescription>
            Search, filter by role or ban status, change a role, or ban someone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {"error" in result ? (
            <p className="text-sm text-destructive">{result.error}</p>
          ) : (
            <UsersTable
              initialUsers={result.users}
              initialTotal={result.total}
              currentUserId={session?.user.id ?? ""}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
