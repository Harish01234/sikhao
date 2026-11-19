import Link from "next/link"

import { contact } from "@/demodata/contact"

function SocialIcon({ name }: { name: "Instagram" | "Facebook" | "LinkedIn" }) {
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    )
  }

  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-1.2c0-.5.4-.8 1-.8Z"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.5 9H4v12h2.5V9ZM5.2 3.4A1.6 1.6 0 1 0 5.2 6.6 1.6 1.6 0 0 0 5.2 3.4ZM20 21h-2.5v-6.2c0-1.8-.7-2.4-1.7-2.4s-1.9.8-1.9 2.5V21H11.4V9H14v1.6c.5-.8 1.6-1.8 3.3-1.8 2.2 0 3.7 1.4 3.7 4.4V21Z"
      />
    </svg>
  )
}

const socials = [
  { label: "Instagram" as const, href: contact.instagram },
  { label: "Facebook" as const, href: contact.facebook },
  { label: "LinkedIn" as const, href: contact.linkedin },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold">Sikhao</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Anyone can learn. Anyone can teach.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2 text-sm">
          <Link href="/sign-in" className="text-foreground hover:text-primary">
            Sign in
          </Link>
          <Link href="/sign-up" className="text-foreground hover:text-primary">
            Sign up
          </Link>
          <a
            href={`mailto:${contact.email}`}
            className="break-all text-muted-foreground"
          >
            {contact.email}
          </a>
          <a href={`tel:${contact.phone}`} className="text-muted-foreground">
            {contact.phone}
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
            >
              <SocialIcon name={item.label} />
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
