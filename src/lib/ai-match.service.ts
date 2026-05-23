'use client';

import { type JobWithEmployer } from '@/lib/supabase/types';

export type AIJobMatchAnalysis = {
  score: number;
  matchLevel: string;
  strengths: string[];
  gaps: string[];
  skillMatch: {
    matching: string[];
    missing: string[];
    bonus: string[];
  };
  recommendation: string;
};

export async function analyzeJobMatchWithAI(
  job: JobWithEmployer,
  candidateProfile: {
    skills: string[];
    sectors: string[];
    jobTypes: string[];
    remotePreference: string | null;
    experienceYears: number | null;
    desiredSalaryMin: number | null;
    fullName?: string | null;
    headline?: string | null;
  }
): Promise<AIJobMatchAnalysis> {
  try {
    const response = await fetch('/api/ai/match-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle: job.title,
        jobDescription: job.description,
        jobSkills: job.skills || [],
        jobSector: job.sector,
        jobType: job.job_type,
        jobRemoteType: job.remote_type,
        candidateProfile: {
          fullName: candidateProfile.fullName,
          headline: candidateProfile.headline,
          skills: candidateProfile.skills,
          sectors: candidateProfile.sectors,
          jobTypes: candidateProfile.jobTypes,
          remotePreference: candidateProfile.remotePreference,
          experienceYears: candidateProfile.experienceYears,
          desiredSalaryMin: candidateProfile.desiredSalaryMin,
          bio: '', // Not needed for matching
          linkedinUrl: '', // Not needed for matching
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI matching failed: ${response.status}`);
    }

    const data = await response.json();
    return data.matchAnalysis;
  } catch (error) {
    console.error('AI matching error, falling back to heuristic:', error);
    // Fallback to heuristic matching if AI fails
    const { scoreCandidateJobMatch } from '@/lib/candidate-job-match';
    return scoreCandidateJobMatch({
      candidate: {
        skills: candidateProfile.skills,
        sectors: candidateProfile.sectors,
        jobTypes: candidateProfile.jobTypes,
        remotePreference: candidateProfile.remotePreference,
        desiredSalaryMin: candidateProfile.desiredSalaryMin,
        experienceYears: candidateProfile.experienceYears,
      },
      job: {
        sector: job.sector,
        job_type: job.job_type,
        remote_type: job.remote_type,
        salary_min: job.salary_min,
        skills: job.skills || [],
        seniority: job.seniority,
        is_featured: job.is_featured,
      }
    }) as unknown as AIJobMatchAnalysis;
  }
}