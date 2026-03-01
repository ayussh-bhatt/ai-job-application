"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || "Login failed");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("token", data.access_token);
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-[var(--background)] px-4">
      <Card className="w-full max-w-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome back</h2>
        <p className="text-[var(--muted-foreground)] text-center text-sm mb-6">
          Sign in to continue to your dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-[var(--radius)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 text-[var(--destructive)] text-sm">
              {error}
            </div>
          )}

          <Input
            type="email"
            placeholder="you@example.com"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="••••••••"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
