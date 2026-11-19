import { PublicNavbar } from "@/components/layout/public-navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col overflow-x-clip bg-background text-foreground">
      <PublicNavbar />
      {children}
    </div>
  )
}
