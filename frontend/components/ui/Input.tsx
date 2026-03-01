"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--muted-foreground)]">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 rounded-[var(--radius)] bg-zinc-900/50 border border-[var(--border)]
          text-white placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
          transition-colors
          ${error ? "border-[var(--destructive)]" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
    </div>
  );
}
