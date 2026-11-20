"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BookOpen, GraduationCap, Mail, UserRound } from "lucide-react";

import { GoogleMark } from "@/app/(auth)/google-mark";
import { PasswordField } from "@/app/(auth)/password-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { dashboardPath, type AppRole } from "@/lib/auth-role";

export function SignUpForm() {
  const router = useRouter();
  const [role, setRole] = React.useState<AppRole>("learner");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<"email" | "google" | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending("email");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const picked = role === "instructor" ? "instructor" : "learner";

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      role: picked,
    } as Parameters<typeof authClient.signUp.email>[0]);

    if (result.error) {
      setError(result.error.message ?? "Could not create the account.");
      setPending(null);
      return;
    }

    router.push(dashboardPath(picked));
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    setPending("google");

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/sign-up",
      newUserCallbackURL: "/sign-up",
    });

    if (result.error) {
      setError(result.error.message ?? "Could not continue with Google.");
      setPending(null);
    }
  }

  return (
    <Card className="shadow-lg ring-1 ring-foreground/10">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Anyone can learn. Anyone can teach. Pick one to start.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>I want to</FieldLabel>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={role === "learner" ? "default" : "outline"}
                  className="h-auto w-full justify-start gap-3 px-3 py-3 whitespace-normal"
                  aria-pressed={role === "learner"}
                  onClick={() => setRole("learner")}
                >
                  <BookOpen />
                  <span className="flex flex-col items-start">
                    <span>Learn</span>
                    <span className="text-xs font-normal opacity-80">
                      Take courses
                    </span>
                  </span>
                </Button>
                <Button
                  type="button"
                  variant={role === "instructor" ? "default" : "outline"}
                  className="h-auto w-full justify-start gap-3 px-3 py-3 whitespace-normal"
                  aria-pressed={role === "instructor"}
                  onClick={() => setRole("instructor")}
                >
                  <GraduationCap />
                  <span className="flex flex-col items-start">
                    <span>Teach</span>
                    <span className="text-xs font-normal opacity-80">
                      Share a course
                    </span>
                  </span>
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon>
                  <UserRound />
                </InputGroupAddon>
                <InputGroupInput
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  className="h-10"
                  required
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  className="h-10"
                  required
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordField
                id="password"
                name="password"
                autoComplete="new-password"
              />
              <FieldDescription>Use 8 or more characters.</FieldDescription>
            </Field>
            <FieldError>{error}</FieldError>
            <Button type="submit" size="lg" className="w-full" disabled={pending !== null}>
              {pending === "email" ? <Spinner /> : null}
              Sign up
            </Button>
          </FieldGroup>
        </form>
        <FieldSeparator className="my-4">or</FieldSeparator>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={pending !== null}
          onClick={onGoogle}
        >
          {pending === "google" ? <Spinner /> : <GoogleMark className="size-4" />}
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="justify-center border-t-0 bg-transparent">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
