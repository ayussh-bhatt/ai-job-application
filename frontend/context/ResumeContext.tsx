"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type JobType = {
  title: string;
  company: string;
  match_score?: number;
  url?: string;
};

type ResumeContextType = {
  skills: string[];
  setSkills: (skills: string[]) => void;

  jobs: JobType[];
  setJobs: (jobs: JobType[]) => void;

  resumeUploaded: boolean;
  setResumeUploaded: (val: boolean) => void;

  resumeData: { skills?: string[] } | null;
  setResumeData: (data: { skills?: string[] } | null) => void;

  selectedJob: JobType | null;
  setSelectedJob: (job: JobType | null) => void;
};

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeData, setResumeData] = useState<{ skills?: string[] } | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);

  return (
    <ResumeContext.Provider
      value={{
        skills,
        setSkills,
        jobs,
        setJobs,
        resumeUploaded,
        setResumeUploaded,
        resumeData,
        setResumeData,
        selectedJob,
        setSelectedJob,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);

  if (!context) {
    throw new Error("useResume must be used inside ResumeProvider");
  }

  return context;
}