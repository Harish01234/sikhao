import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--primary),transparent_68%)] opacity-20"
      />
      <header className="relative flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex min-w-0 items-center">
          <BrandLogo className="h-7 sm:h-8" />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
