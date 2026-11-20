"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboardIcon } from "lucide-react"

import { AccountMenu, type AccountUser } from "@/components/layout/account-menu"
import { BrandLogo } from "@/components/layout/brand-logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export type AppNavItem = {
  title: string
  href: string
}

export function AppShell({
  label,
  items,
  user,
  children,
}: {
  label: string
  items: AppNavItem[]
  user: AccountUser
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar label={label} items={items} user={user} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4">
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function AppSidebar({
  label,
  items,
  user,
}: {
  label: string
  items: AppNavItem[]
  user: AccountUser
}) {
  const pathname = usePathname()
  const homeHref = items[0]?.href ?? "/"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={homeHref} className="flex items-center rounded-md px-2 py-1">
          <span className="group-data-[collapsible=icon]:hidden">
            <BrandLogo />
          </span>
          <span className="hidden group-data-[collapsible=icon]:inline-flex">
            <BrandLogo variant="icon" />
          </span>
        </Link>
        <p className="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          {label}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <LayoutDashboardIcon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <AccountMenu user={user} trigger="sidebar" />
      </SidebarFooter>
    </Sidebar>
  )
}
