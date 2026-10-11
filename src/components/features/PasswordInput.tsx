"use client";
import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/kit";

export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>((p, ref) => {
  const [show, setShow] = useState(false);
  return <Input ref={ref} {...p} type={show ? "text" : "password"} icon={<Lock />}
    right={<button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="grid h-8 w-8 place-items-center text-faint hover:text-fg">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />;
});
PasswordInput.displayName = "PasswordInput";
