
export interface Job {
  id: string;
  title: string;
  company: string;
  date?: string;
}

export interface JobStats {
  applied: number;
  pending: number;
  clarify: number;
  rejected: number;
  total: number;
}

export interface RecentJobs {
  applied: any[];
  pending: any[];
  clarify: any[];
  rejected: any[];
}

export interface UserApplicationStatus {
  user_id: string;
  email: string;
  status: {
    accepted?: any[];
    rejected?: any[];
    onprocess?: any[];
  };
}
