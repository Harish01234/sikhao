"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roleLabel, type AppRole } from "@/lib/auth-role";

import {
  banUser,
  listUsers,
  setUserRole,
  unbanUser,
  type AdminUser,
  type RoleFilter,
  type StatusFilter,
} from "./actions";

const roles: AppRole[] = ["learner", "instructor", "admin"];
const roleItems = roles.map((role) => ({ value: role, label: roleLabel(role) }));
const roleFilterItems = [
  { value: "all", label: "All roles" },
  ...roleItems,
  { value: "none", label: "No role" },
];
const statusFilterItems = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];
const pageSize = 10;

export function UsersTable({
  initialUsers,
  initialTotal,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  initialTotal: number;
  currentUserId: string;
}) {
  const [users, setUsers] = React.useState(initialUsers);
  const [total, setTotal] = React.useState(initialTotal);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [page, setPage] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const hasNext = (page + 1) * pageSize < total;

  async function load(next: {
    search: string;
    page: number;
    role: RoleFilter;
    status: StatusFilter;
  }) {
    setLoading(true);
    setError(null);

    const result = await listUsers(next);

    if (!result.users || result.total === undefined || result.page === undefined) {
      setError(result.error ?? "Could not load people.");
      setLoading(false);
      return;
    }

    setUsers(result.users);
    setTotal(result.total);
    setPage(result.page);
    setLoading(false);
  }

  async function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await load({ search, page: 0, role: roleFilter, status: statusFilter });
  }

  async function onRole(userId: string, role: AppRole) {
    setPendingId(userId);
    setError(null);

    const result = await setUserRole(userId, role);

    if (result.error) {
      setError(result.error);
      setPendingId(null);
      return;
    }

    setPendingId(null);
    await load({ search, page, role: roleFilter, status: statusFilter });
  }

  async function onBan(user: AdminUser) {
    setPendingId(user.id);
    setError(null);

    const result = user.banned ? await unbanUser(user.id) : await banUser(user.id);

    if (result.error) {
      setError(result.error);
      setPendingId(null);
      return;
    }

    setPendingId(null);
    await load({ search, page, role: roleFilter, status: statusFilter });
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={onSearch}
        className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="w-full sm:max-w-sm"
          aria-label="Search people"
        />
        <Select
          items={roleFilterItems}
          value={roleFilter}
          onValueChange={(value) => {
            const next = roleFilterItems.some((item) => item.value === value)
              ? (value as RoleFilter)
              : "all";
            setRoleFilter(next);
            void load({ search, page: 0, role: next, status: statusFilter });
          }}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleFilterItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={statusFilterItems}
          value={statusFilter}
          onValueChange={(value) => {
            const next =
              value === "active" || value === "banned" ? value : "all";
            setStatusFilter(next);
            void load({ search, page: 0, role: roleFilter, status: next });
          }}
        >
          <SelectTrigger className="w-full sm:w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading || page === 0}
            onClick={() =>
              load({ search, page: page - 1, role: roleFilter, status: statusFilter })
            }
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading || !hasNext}
            onClick={() =>
              load({ search, page: page + 1, role: roleFilter, status: statusFilter })
            }
          >
            Next
          </Button>
        </div>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No people found.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <article
                key={user.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-card-foreground"
              >
                <PersonSummary user={user} />
                <PersonActions
                  user={user}
                  currentUserId={currentUserId}
                  pending={pendingId === user.id}
                  onRole={onRole}
                  onBan={onBan}
                />
              </article>
            ))}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleControl
                        user={user}
                        currentUserId={currentUserId}
                        pending={pendingId === user.id}
                        onRole={onRole}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge banned={user.banned} />
                    </TableCell>
                    <TableCell>
                      <BanButton
                        user={user}
                        currentUserId={currentUserId}
                        pending={pendingId === user.id}
                        onBan={onBan}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function PersonSummary({ user }: { user: AdminUser }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">{user.name}</p>
      <p className="truncate text-muted-foreground">{user.email}</p>
    </div>
  );
}

function PersonActions({
  user,
  currentUserId,
  pending,
  onRole,
  onBan,
}: {
  user: AdminUser;
  currentUserId: string;
  pending: boolean;
  onRole: (userId: string, role: AppRole) => void;
  onBan: (user: AdminUser) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <RoleControl
        user={user}
        currentUserId={currentUserId}
        pending={pending}
        onRole={onRole}
      />
      <StatusBadge banned={user.banned} />
      <BanButton
        user={user}
        currentUserId={currentUserId}
        pending={pending}
        onBan={onBan}
      />
    </div>
  );
}

function RoleControl({
  user,
  currentUserId,
  pending,
  onRole,
}: {
  user: AdminUser;
  currentUserId: string;
  pending: boolean;
  onRole: (userId: string, role: AppRole) => void;
}) {
  if (user.id === currentUserId) {
    return user.role ? (
      <Badge variant="secondary">{roleLabel(user.role)}</Badge>
    ) : (
      <Badge variant="outline">No role</Badge>
    );
  }

  return (
    <Select
      items={roleItems}
      value={user.role}
      onValueChange={(value) => {
        if (value === "learner" || value === "instructor" || value === "admin") {
          onRole(user.id, value);
        }
      }}
    >
      <SelectTrigger className="w-full md:w-36" disabled={pending} aria-label={`Role for ${user.name}`}>
        <SelectValue placeholder="Choose a role" />
      </SelectTrigger>
      <SelectContent>
        {roleItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StatusBadge({ banned }: { banned: boolean }) {
  return banned ? (
    <Badge variant="destructive">Banned</Badge>
  ) : (
    <Badge variant="secondary">Active</Badge>
  );
}

function BanButton({
  user,
  currentUserId,
  pending,
  onBan,
}: {
  user: AdminUser;
  currentUserId: string;
  pending: boolean;
  onBan: (user: AdminUser) => void;
}) {
  if (user.id === currentUserId) {
    return <span className="text-sm text-muted-foreground">You</span>;
  }

  return (
    <Button
      type="button"
      variant={user.banned ? "outline" : "destructive"}
      className="w-full md:w-auto"
      disabled={pending}
      onClick={() => onBan(user)}
    >
      {user.banned ? "Unban" : "Ban"}
    </Button>
  );
}
