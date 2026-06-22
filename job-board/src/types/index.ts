
export interface Profile {
  id: string;
  role: 'recruiter' | 'candidate';
  full_name: string;
  created_at: string;
}

export interface JobPosting { //cammelCase
  id: string;
  recruiter_id: string;
  company: string;
  position: string;
  location: string;
  salary_min: number;
  salary_max: number;
  description: string;
  is_active: boolean;
  posted_at: string;
  created_at: string;
  application_count: number; 
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  applicant_name: string;
  applicant_email: string;
  cover_letter: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted';
  applied_at: string;
  job_postings?: JobPosting; 
}

export interface JobWithApplication extends Omit<JobPosting, 'application_count'> {
  applications?: Application[];
  application_count?: number;
  user_application?: Application | null;
}