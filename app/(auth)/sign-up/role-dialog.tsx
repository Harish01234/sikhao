"use client";

import * as React from "react";
import { BookOpen, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { AppRole } from "@/lib/auth-role";

import { chooseRole } from "./actions";

const choices = [
  {
    role: "learner" as const,
    title: "I want to learn",
    text: "Join courses and learn from other people.",
    icon: BookOpen,
  },
  {
    role: "instructor" as const,
    title: "I want to teach",
    text: "Create a course and teach other people.",
    icon: GraduationCap,
  },
];

export function RoleDialog() {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<AppRole | null>(null);

  async function onChoose(role: AppRole) {
    setError(null);
    setPending(role);

    const result = await chooseRole(role);

    if (result?.error) {
      setError(result.error);
      setPending(null);
    }
  }

  return (
    <Dialog open disablePointerDismissal>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose how you want to start</DialogTitle>
          <DialogDescription>
            Anyone can learn. Anyone can teach. Pick one now. This is the area
            you will open next, and you only choose it once.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {choices.map((choice) => {
            const Icon = choice.icon;
            const waiting = pending === choice.role;

            return (
              <Button
                key={choice.role}
                type="button"
                variant="outline"
                className="h-auto w-full items-start justify-start gap-3 px-3 py-3 text-left whitespace-normal"
                disabled={pending !== null}
                onClick={() => onChoose(choice.role)}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {waiting ? <Spinner /> : <Icon />}
                </span>
                <span className="flex min-w-0 flex-col items-start gap-0.5">
                  <span className="font-medium">{choice.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {choice.text}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
        <FieldError>{error}</FieldError>
      </DialogContent>
    </Dialog>
  );
}
