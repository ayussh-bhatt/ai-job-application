"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useResume } from "@/context/ResumeContext";
import type { JobType } from "@/context/ResumeContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Jobs() {
  const router = useRouter();
  const { resumeData, setResumeData, jobs, setJobs, setSelectedJob } = useResume();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const uploadResume = async () => {
    if (!file) return;
    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResumeData(data.extracted_data);
      } else {
        setUploadError(data.detail || "Upload failed");
      }
    } catch {
      setUploadError("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const fetchJobs = async () => {
    setFetching(true);
    try {
      let url = "http://127.0.0.1:8000/jobs/";
      if (resumeData?.skills?.length) {
        const params = resumeData.skills
          .map((s: string) => `skills=${encodeURIComponent(s)}`)
          .join("&");
        url += `?${params}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch {
      setJobs([]);
    } finally {
      setFetching(false);
    }
  };

  const handleApply = (job: JobType) => {
    setSelectedJob(job);
    router.push(`/jobs/${encodeURIComponent(job.title)}`);
  };

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--background)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Find Jobs</h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Upload your resume to get personalized job recommendations
            </p>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Step 1: Upload Resume</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <label className="flex-1 w-full cursor-pointer">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setUploadError("");
                  }}
                  className="block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[var(--primary)] file:text-black file:font-semibold file:cursor-pointer hover:file:bg-[var(--primary-hover)]"
                />
              </label>
              <Button
                onClick={uploadResume}
                disabled={!file}
                isLoading={uploading}
              >
                Upload
              </Button>
            </div>
            {uploadError && (
              <p className="mt-2 text-sm text-[var(--destructive)]">{uploadError}</p>
            )}
            {resumeData && (
              <p className="mt-2 text-sm text-[var(--primary)]">
                Resume parsed. {resumeData.skills?.length ?? 0} skills extracted.
              </p>
            )}
          </Card>

          {resumeData && (
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Step 2: Search Jobs</h2>
              <Button onClick={fetchJobs} isLoading={fetching}>
                Search Jobs
              </Button>
            </Card>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            {fetching ? (
              <Card className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[var(--muted-foreground)]">Searching for jobs...</p>
              </Card>
            ) : jobs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-[var(--muted-foreground)]">
                  {resumeData
                    ? "Click &quot;Search Jobs&quot; to find opportunities"
                    : "Upload your resume to get started"}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, i) => (
                  <Card key={i} hover className="p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-[var(--muted-foreground)]">{job.company}</p>
                        {job.match_score != null && (
                          <p className="mt-2 text-sm">
                            Match:{" "}
                            <span className="text-[var(--primary)] font-medium">
                              {job.match_score}%
                            </span>
                          </p>
                        )}
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => handleApply(job)}
                        className="shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
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
