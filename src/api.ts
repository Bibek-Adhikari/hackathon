import { User, Problem, Solution, LeaderboardEntry } from './types';

const TOKEN_KEY = 'codehelp_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

function getHeaders(isFormData = false): HeadersInit {
  const headers: Record<string, string> = {};
  const token = tokenStorage.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export const api = {
  // Auth
  async getMe(): Promise<User | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }
    tokenStorage.set(data.token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }
    tokenStorage.set(data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      tokenStorage.clear();
    }
  },

  async switchDemo(userId: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/switch-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to switch user');
    }
    tokenStorage.set(data.token);
    return data;
  },

  async getDemoUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/demo-users');
    const data = await res.json();
    return data.users || [];
  },

  // Problems
  async getProblems(status?: 'open' | 'solved'): Promise<Problem[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`/api/problems${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load problems');
    return data.problems;
  },

  async getProblem(id: string): Promise<{ problem: Problem; solutionsCount: number }> {
    const res = await fetch(`/api/problems/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Problem not found');
    return data;
  },

  async createProblem(formData: FormData): Promise<{ problem: Problem; token?: string; user?: User }> {
    const headers = getHeaders(true);
    const res = await fetch('/api/problems', {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to post problem');
    if (data.token) {
      tokenStorage.set(data.token);
    }
    return data;
  },

  getProblemDownloadUrl(id: string): string {
    return `/api/problems/${id}/download`;
  },

  // Solutions
  async getSolutions(problemId: string): Promise<Solution[]> {
    const res = await fetch(`/api/problems/${problemId}/solutions`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load solutions');
    return data.solutions;
  },

  async createSolution(problemId: string, formData: FormData): Promise<{ solution: Solution; token?: string; user?: User }> {
    const headers = getHeaders(true);
    const res = await fetch(`/api/problems/${problemId}/solutions`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit solution');
    if (data.token) {
      tokenStorage.set(data.token);
    }
    return data;
  },

  async acceptSolution(solutionId: string): Promise<{ message: string; problem: Problem; solution: Solution }> {
    const res = await fetch(`/api/solutions/${solutionId}/accept`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to accept solution');
    return data;
  },

  getSolutionDownloadUrl(id: string): string {
    return `/api/solutions/${id}/download`;
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load leaderboard');
    return data.leaderboard;
  },
};
