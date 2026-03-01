"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useResume } from "@/context/ResumeContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function JobApply() {
  const router = useRouter();
  const params = useParams();
  const { selectedJob, resumeData, setSelectedJob } = useResume();
  const jobTitle = decodeURIComponent(params.id as string);

  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);

  const company = selectedJob?.company ?? "Company";
  const skills = resumeData?.skills ?? [];

  useEffect(() => {
    if (!selectedJob && jobTitle) {
      router.replace("/jobs");
    }
  }, [selectedJob, jobTitle, router]);

  const generateLetter = async () => {
    setGenerating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle,
          company,
          skills,
        }),
      });

      const data = await res.json();
      setCoverLetter(data.cover_letter ?? "");
    } catch {
      setCoverLetter("");
    } finally {
      setGenerating(false);
    }
  };

  const applyJob = async () => {
    const token = localStorage.getItem("token");
    setApplying(true);

    try {
      await fetch("http://127.0.0.1:8000/applications/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobTitle,
          company,
          url: selectedJob?.url ?? jobTitle,
          status: "Applied",
          date: new Date().toLocaleDateString(),
        }),
      });

      setSelectedJob(null);
      router.replace("/dashboard");
    } finally {
      setApplying(false);
    }
  };

  if (!selectedJob && jobTitle) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--background)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={() => router.push("/jobs")}
            className="text-[var(--muted-foreground)] hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Jobs
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">{jobTitle}</h1>
            <p className="text-[var(--muted-foreground)] mt-1">{company}</p>
          </div>

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Cover Letter</h2>
            <p className="text-[var(--muted-foreground)] text-sm mb-4">
              Generate an AI-powered cover letter tailored to this role and your skills.
            </p>
            <Button
              onClick={generateLetter}
              isLoading={generating}
              variant="secondary"
            >
              Generate Cover Letter
            </Button>
          </Card>

          {coverLetter && (
            <Card className="p-6 mb-6">
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Edit your cover letter (optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full h-64 px-4 py-3 rounded-[var(--radius)] bg-zinc-900/50 border border-[var(--border)] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                placeholder="Your cover letter..."
              />
              <Button
                onClick={applyJob}
                isLoading={applying}
                className="mt-4"
              >
                Confirm & Apply
              </Button>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
