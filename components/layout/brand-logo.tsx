import Image from "next/image"

import { cn } from "@/lib/utils"

export function BrandLogo({
  variant = "horizontal",
  className,
}: {
  variant?: "horizontal" | "icon"
  className?: string
}) {
  if (variant === "icon") {
    return (
      <Image
        src="/sikhao-icon.svg"
        alt="Sikhao"
        width={32}
        height={32}
        className={cn("size-8", className)}
      />
    )
  }

  return (
    <>
      <Image
        src="/sikhao-logo-horizontal.svg"
        alt="Sikhao"
        width={205}
        height={64}
        priority
        className={cn("h-8 w-auto dark:hidden", className)}
      />
      <Image
        src="/sikhao-logo-horizontal-dark.svg"
        alt=""
        width={205}
        height={64}
        aria-hidden
        className={cn("hidden h-8 w-auto dark:block", className)}
      />
    </>
  )
}
