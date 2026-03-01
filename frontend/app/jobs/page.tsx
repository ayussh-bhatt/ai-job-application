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
  const [fetchError, setFetchError] = useState("");

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
    setFetchError("");
    try {
      const hasResumeData = resumeData?.skills?.length && (resumeData?.text ?? "").trim().length > 0;
      let data: { jobs: JobType[] };

      if (hasResumeData) {
        const res = await fetch("http://127.0.0.1:8000/jobs/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: resumeData.skills,
            resume_text: resumeData.text,
          }),
        });
        data = await res.json();
      } else {
        let url = "http://127.0.0.1:8000/jobs/";
        if (resumeData?.skills?.length) {
          const params = resumeData.skills
            .map((s: string) => `skills=${encodeURIComponent(s)}`)
            .join("&");
          url += `?${params}`;
        }
        const res = await fetch(url);
        data = await res.json();
      }

      const rawJobs = data.jobs ?? [];
      const jobsList = rawJobs.filter((j: JobType) => !("_error" in j));
      if (rawJobs.length > 0 && (rawJobs[0] as JobType & { _error?: string })._error) {
        setFetchError((rawJobs[0] as JobType & { _error?: string })._error ?? "Failed to fetch jobs");
      }
      setJobs(jobsList);
    } catch {
      setFetchError("Failed to fetch jobs");
      setJobs([]);
    } finally {
      setFetching(false);
    }
  };

  const handleApply = (job: JobType) => {
    setSelectedJob(job);
    router.push(`/jobs/${encodeURIComponent(job.title)}`);
  };

  const skills = resumeData?.skills ?? [];

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
              <div className="mt-4">
                <p className="text-sm font-medium text-[var(--primary)] mb-2">
                  Extracted skills ({skills.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--primary-muted)] text-[var(--primary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
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
            ) : (
              <>
              {fetchError && (
                <div className="mb-4 p-3 rounded-[var(--radius)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 text-[var(--destructive)] text-sm">
                  {fetchError}
                </div>
              )}
              {jobs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-[var(--muted-foreground)]">
                  {resumeData
                    ? "Click &quot;Search Jobs&quot; to find opportunities"
                    : "Upload your resume to get started"}
                </p>
              </Card>
            ) : (
              <>
              <div className="space-y-4">
                {jobs.map((job, i) => (
                  <Card
                    key={i}
                    hover
                    className={`p-5 ${job.is_top_match ? "ring-2 ring-[var(--primary)]" : ""}`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            {job.is_top_match && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--primary)] text-black">
                                Top match
                              </span>
                            )}
                          </div>
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
                      {job.is_top_match && job.missing_skills && job.missing_skills.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border)]">
                          <p className="text-sm text-[var(--muted-foreground)] mb-1">
                            Improve your chances by learning:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.missing_skills.map((skill, j) => (
                              <span
                                key={j}
                                className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              </>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
