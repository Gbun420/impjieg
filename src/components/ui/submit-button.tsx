"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  pendingText?: string;
}

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      isLoading={pending}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
