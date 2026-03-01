"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Dashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [email, setEmail] = useState("");
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

    const loadApplications = async () => {
      const res = await fetch("http://127.0.0.1:8000/applications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };

    loadApplications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--background)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                Track and manage your job applications
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/jobs")}>
                Apply to Jobs
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="text-[var(--muted-foreground)]">
                Logout
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-10">
            <Card className="p-6">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Email</p>
              <p className="mt-1 text-lg font-medium truncate">{email || "—"}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Total Applications</p>
              <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                {isLoading ? "—" : applications.length}
              </p>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Applied Jobs</h2>

            {isLoading ? (
              <Card className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[var(--muted-foreground)]">Loading applications...</p>
              </Card>
            ) : applications.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-[var(--muted-foreground)] mb-6">
                  No applications yet. Upload your resume and start applying.
                </p>
                <Button onClick={() => router.push("/jobs")}>
                  Find Jobs
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {applications.map((job, i) => (
                  <Card key={i} hover className="p-4 flex justify-between items-center">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{job.title}</p>
                      <p className="text-sm text-[var(--muted-foreground)] truncate">{job.company}</p>
                    </div>
                    <span className="ml-4 shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
                      {job.status}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
