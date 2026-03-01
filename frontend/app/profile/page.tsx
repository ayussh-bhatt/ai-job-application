"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.sub);
    } catch {
      setEmail("");
    }

    const load = async () => {
      const res = await fetch("http://127.0.0.1:8000/applications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };

    load();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--background)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Your account overview
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Email</p>
                <p className="mt-1 text-lg">{email || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Total Applications</p>
                <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                  {isLoading ? "—" : apps.length}
                </p>
              </div>
            </div>
          </Card>

          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}
