"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-[var(--background)] text-white text-center px-6">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
          Welcome back
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-md mb-10 text-lg">
          Continue managing your job applications and discover new opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" size="lg">
              Find Jobs
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-[var(--background)] text-white text-center px-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight leading-tight">
          Land your next role
          <span className="text-[var(--primary)]"> faster</span>
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-xl mx-auto mb-12 text-lg leading-relaxed">
          Discover jobs tailored to your skills, generate AI-powered cover letters,
          and track your applications — all in one intelligent platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button variant="primary" size="lg">
              Get started free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
