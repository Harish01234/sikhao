"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Mail } from "lucide-react";

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
import { dashboardPath, isAppRole } from "@/lib/auth-role";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<"email" | "google" | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending("email");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      setError(result.error.message ?? "Could not sign in.");
      setPending(null);
      return;
    }

    const role =
      result.data?.user && "role" in result.data.user
        ? String(result.data.user.role ?? "")
        : "";

    router.push(isAppRole(role) ? dashboardPath(role) : "/sign-up");
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    setPending("google");

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/sign-up",
    });

    if (result.error) {
      setError(result.error.message ?? "Could not continue with Google.");
      setPending(null);
    }
  }

  return (
    <Card className="shadow-lg ring-1 ring-foreground/10">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use your email or Google. Your role is already saved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
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
                autoComplete="current-password"
              />
            </Field>
            <FieldError>{error}</FieldError>
            <Button type="submit" size="lg" className="w-full" disabled={pending !== null}>
              {pending === "email" ? <Spinner /> : null}
              Sign in
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
          New to Sikhao?{" "}
          <Link href="/sign-up" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
