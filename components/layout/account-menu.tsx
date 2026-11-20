"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { roleLabel, type AppRole } from "@/lib/auth-role";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type AccountUser = {
  name: string;
  email: string;
  image: string | null;
  role: AppRole | null;
};

function displayName(name: string) {
  const trimmed = name.trim();

  if (trimmed.length > 1 && trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return trimmed;
}

function initials(name: string) {
  const letters = displayName(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return letters || "?";
}

function UserAvatar({ user }: { user: AccountUser }) {
  return (
    <Avatar>
      {user.image ? <AvatarImage src={user.image} alt="" /> : null}
      <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function AccountMenuContent({
  user,
  side,
  align,
  showIdentity,
}: {
  user: AccountUser;
  side: "top" | "bottom";
  align: "start" | "end";
  showIdentity: boolean;
}) {
  const router = useRouter();
  const label = user.role ? roleLabel(user.role) : null;
  const name = displayName(user.name);

  async function onLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenuContent
      side={side}
      align={align}
      sideOffset={8}
      className="w-72!"
    >
      <DropdownMenuGroup>
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          {showIdentity ? (
            <span className="flex items-center gap-3">
              <UserAvatar user={user} />
              <span className="grid min-w-0 flex-1 gap-1 text-left">
                <span className="truncate text-sm font-medium text-foreground">
                  {name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
                {label ? (
                  <span className="w-fit rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                    {label}
                  </span>
                ) : null}
              </span>
            </span>
          ) : (
            <span className="grid gap-0.5 text-left">
              <span className="text-xs text-muted-foreground">Signed in as</span>
              <span className="truncate text-sm text-foreground">{user.email}</span>
            </span>
          )}
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        className="px-2 py-2"
        onClick={onLogout}
      >
        <LogOutIcon />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export function AccountMenu({
  user,
  trigger = "navbar",
}: {
  user: AccountUser;
  trigger?: "sidebar" | "navbar" | "sheet";
}) {
  const label = user.role ? roleLabel(user.role) : null;
  const name = displayName(user.name);

  if (trigger === "sidebar") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  tooltip={name}
                  className="h-auto min-h-12 py-2"
                />
              }
            >
              <UserAvatar user={user} />
              <span className="grid min-w-0 flex-1 gap-1 text-left group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{name}</span>
                {label ? (
                  <span className="w-fit rounded-md bg-sidebar-accent px-1.5 py-0.5 text-[0.65rem] leading-none text-sidebar-accent-foreground">
                    {label}
                  </span>
                ) : null}
              </span>
            </DropdownMenuTrigger>
            <AccountMenuContent
              user={user}
              side="top"
              align="start"
              showIdentity={false}
            />
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (trigger === "sheet") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-3 px-3 py-2"
            />
          }
        >
          <UserAvatar user={user} />
          <span className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate font-medium">{name}</span>
            {label ? (
              <span className="truncate text-xs font-normal text-muted-foreground">
                {label}
              </span>
            ) : null}
          </span>
        </DropdownMenuTrigger>
        <AccountMenuContent
          user={user}
          side="bottom"
          align="start"
          showIdentity
        />
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Account menu" />
        }
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <AccountMenuContent user={user} side="bottom" align="end" showIdentity />
    </DropdownMenu>
  );
}
