export interface User {
  id: string;
  name: string;
  email: string;
  score: number;
  acceptedCount: number;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  posterId: string;
  posterName: string;
  createdAt: string;
  status: 'open' | 'solved';
  solutionsCount?: number;
  originalZipName: string;
  originalZipSize: number;
  acceptedSolutionId?: string | null;
  acceptedSolverName?: string | null;
}

export interface Solution {
  id: string;
  problemId: string;
  solverId: string;
  solverName: string;
  createdAt: string;
  accepted: boolean;
  fixedZipName: string;
  fixedZipSize: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  email: string;
  score: number;
  acceptedCount: number;
  createdAt: string;
}
