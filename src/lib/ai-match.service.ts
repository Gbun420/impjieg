'use client';

import { type JobWithEmployer } from '@/lib/supabase/types';
import { scoreCandidateJobMatch } from '@/lib/candidate-job-match';

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
    job_types: string[];
    remote_preference: string | null;
    experience_years: number | null;
    desired_salary_min: number | null;
    full_name?: string | null;
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
          full_name: candidateProfile.full_name,
          headline: candidateProfile.headline,
          skills: candidateProfile.skills,
          sectors: candidateProfile.sectors,
          job_types: candidateProfile.job_types,
          remote_preference: candidateProfile.remote_preference,
          experience_years: candidateProfile.experience_years,
          desired_salary_min: candidateProfile.desired_salary_min,
          bio: '', // Not needed for matching
          linkedin_url: '', // Not needed for matching
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
    const heuristicResult = scoreCandidateJobMatch({
      candidate: {
        skills: candidateProfile.skills,
        sectors: candidateProfile.sectors,
        job_types: candidateProfile.job_types,
        remote_preference: candidateProfile.remote_preference,
        desired_salary_min: candidateProfile.desired_salary_min,
        experience_years: candidateProfile.experience_years,
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
    });
    
    // Convert heuristic result to AI-compatible format
    return {
      ...heuristicResult,
      skillMatch: {
        matching: [],
        missing: [],
        bonus: []
      },
      recommendation: heuristicResult.score >= 80 
        ? "Strong match - consider moving forward with interview"
        : heuristicResult.score >= 60 
          ? "Good match - worth further discussion"
          : heuristicResult.score >= 40 
            ? "Potential fit - review for skill development opportunities"
            : "Limited overlap - may require significant training",
    };
  }
}