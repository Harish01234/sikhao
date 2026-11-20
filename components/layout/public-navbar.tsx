"use client"

import * as React from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { AccountMenu, type AccountUser } from "@/components/layout/account-menu"
import { BrandLogo } from "@/components/layout/brand-logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { isAppRole } from "@/lib/auth-role"
import { cn } from "@/lib/utils"

export function PublicNavbar() {
  const [open, setOpen] = React.useState(false)
  const { data: session, isPending } = authClient.useSession()
  const user = !isPending && session ? accountUser(session.user) : null

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
        <Link href="/" className="inline-flex min-w-0 items-center">
          <BrandLogo className="h-7 sm:h-8" />
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "secondary" }))}
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants())}>
                Sign up
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4">
                {user ? (
                  <AccountMenu user={user} trigger="sheet" />
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ variant: "secondary" }))}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants())}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function accountUser(user: {
  name: string
  email: string
  image?: string | null
}): AccountUser {
  const role = "role" in user ? user.role : null

  return {
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: typeof role === "string" && isAppRole(role) ? role : null,
  }
}
