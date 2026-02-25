"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  // ✅ Protect route using JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  useEffect(() => {
  const loadApplications = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/applications/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setAppliedJobs(data);
  };

  loadApplications();
}, []);

  const [file, setFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);

  // Upload resume
  const uploadResume = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/resume/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResumeData(data.extracted_data);
  };

  // Fetch jobs
  const fetchJobs = async () => {
    let url = "http://127.0.0.1:8000/jobs/";

    if (resumeData?.skills?.length) {
      const params = resumeData.skills
        .map((s: string) => `skills=${encodeURIComponent(s)}`)
        .join("&");
      url += `?${params}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setJobs(data.jobs);
  };

  // Generate cover letter
  const generateCoverLetter = async (job: any) => {
    setLoading(true);
    setCoverLetter("");

    const res = await fetch("http://127.0.0.1:8000/ai/cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_title: job.title,
        company: job.company,
        skills: resumeData.skills,
      }),
    });

    const data = await res.json();
    setCoverLetter(data.cover_letter);
    setLoading(false);
  };

  // Apply & track job
  const applyToJob = async (job: any) => {
  const exists = appliedJobs.find((j) => j.url === job.url);
  if (exists) return;

  const newJob = {
    title: job.title,
    company: job.company,
    url: job.url,
    status: "Applied",
    date: new Date().toLocaleDateString(),
  };

  const token = localStorage.getItem("token");

  await fetch("http://127.0.0.1:8000/applications/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newJob),
  });

  setAppliedJobs([newJob, ...appliedJobs]);
};

  const maxScore = jobs.length
    ? Math.max(...jobs.map((j) => j.match_score))
    : 0;

  return (
    <div className="p-10 space-y-8 bg-black min-h-screen text-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Job Assistant</h1>

        <button
          onClick={() => router.push("/profile")}
          className="bg-gray-700 px-4 py-2 rounded text-sm"
        >
          Profile
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="bg-red-600 px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* Upload Resume */}
      <div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={uploadResume}
          className="bg-white text-black px-4 py-2 ml-4 rounded"
        >
          Upload Resume
        </button>
      </div>

      {/* Skills */}
      {resumeData && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Extracted Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill: string, i: number) => (
              <span key={i} className="bg-gray-700 px-3 py-1 rounded text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Find Jobs */}
      <button
        onClick={fetchJobs}
        className="bg-blue-600 px-6 py-2 rounded font-semibold"
      >
        Find Jobs
      </button>

      {/* Jobs */}
      <div className="grid gap-4">
        {jobs.map((job, i) => (
          <div
            key={i}
            className={`border p-5 rounded-lg ${
              job.match_score === maxScore && maxScore > 0
                ? "border-green-500 bg-green-900/20"
                : "border-gray-700"
            }`}
          >
            <h3 className="text-lg font-bold">{job.title}</h3>

            {job.match_score === maxScore && maxScore > 0 && (
              <span className="text-green-400 text-sm font-semibold">
                ⭐ Perfect Match
              </span>
            )}

            <p className="text-gray-400 mt-1">
              {job.company} • {job.location}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Match Score: {job.match_score}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => generateCoverLetter(job)}
                className="bg-purple-600 px-4 py-2 rounded text-sm"
              >
                Cover Letter
              </button>

              <button
                onClick={() => applyToJob(job)}
                className="bg-green-600 px-4 py-2 rounded text-sm"
              >
                Apply & Track
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && <p className="text-purple-400">Generating cover letter...</p>}

      {/* Editable Cover Letter */}
      {coverLetter && (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-4">
          <h2 className="text-xl font-semibold">AI Cover Letter</h2>

          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full h-60 bg-black border border-gray-700 rounded p-3 text-gray-200 resize-none focus:outline-none"
          />

          <div className="flex gap-3">
            <button
              onClick={() => {
                const blob = new Blob([coverLetter], {
                  type: "text/plain",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "cover-letter.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-green-600 px-4 py-2 rounded text-sm"
            >
              Download
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(coverLetter)}
              className="bg-blue-600 px-4 py-2 rounded text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}