"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function PasswordField({
  id,
  name,
  autoComplete,
  minLength = 8,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <InputGroup className="h-10">
      <InputGroupAddon>
        <Lock />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder="At least 8 characters"
        className="h-10"
        required
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
