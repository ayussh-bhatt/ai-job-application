"use client";

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ hover, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)]
        ${hover ? "transition-colors hover:bg-[var(--card-hover)]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
