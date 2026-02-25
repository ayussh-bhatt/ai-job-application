"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  // Upload Resume
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

  // Fetch Jobs with skills
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

  // find highest match score
  const maxScore = jobs.length
    ? Math.max(...jobs.map((j) => j.match_score))
    : 0;

  return (
    <div className="p-10 space-y-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold">AI Job Assistant</h1>

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
              <span
                key={i}
                className="bg-gray-700 px-3 py-1 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Find Jobs Button */}
      <button
        onClick={fetchJobs}
        className="bg-blue-600 px-6 py-2 rounded font-semibold"
      >
        Find Jobs
      </button>

      {/* Job Listings */}
      <div className="grid gap-4">
        {jobs.map((job, i) => (
          <div
            key={i}
            className={`border p-5 rounded-lg transition ${
              job.match_score === maxScore && maxScore > 0
                ? "border-green-500 bg-green-900/20"
                : "border-gray-700"
            }`}
          >
            <h3 className="text-lg font-bold">{job.title}</h3>

            {/* Perfect Match Badge */}
            {job.match_score === maxScore && maxScore > 0 && (
              <span className="text-green-400 text-sm font-semibold">
                ⭐ Perfect Match
              </span>
            )}

            <p className="text-gray-400 mt-1">
              {job.company} • {job.location}
            </p>

            {/* Match Score */}
            <p className="text-sm text-gray-400 mt-1">
              Match Score: {job.match_score}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {job.tags?.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-gray-700 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={job.url}
              target="_blank"
              className="text-blue-400 mt-3 inline-block"
            >
              Apply →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}