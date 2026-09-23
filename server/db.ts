import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createZipBuffer } from './utils/zipHelper.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  score: number;
  acceptedCount: number;
  createdAt: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  posterId: string;
  posterName: string;
  originalZipPath: string;
  originalZipName: string;
  originalZipSize: number;
  createdAt: string;
  status: 'open' | 'solved';
  acceptedSolutionId: string | null;
}

export interface Solution {
  id: string;
  problemId: string;
  solverId: string;
  solverName: string;
  fixedZipPath: string;
  fixedZipName: string;
  fixedZipSize: number;
  createdAt: string;
  accepted: boolean;
}

interface DatabaseSchema {
  users: User[];
  problems: Problem[];
  solutions: Solution[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
export const PROJECTS_UPLOAD_DIR = path.resolve(UPLOADS_DIR, 'projects');
export const SOLUTIONS_UPLOAD_DIR = path.resolve(UPLOADS_DIR, 'solutions');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    problems: [],
    solutions: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    // Ensure folders exist
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PROJECTS_UPLOAD_DIR)) fs.mkdirSync(PROJECTS_UPLOAD_DIR, { recursive: true });
    if (!fs.existsSync(SOLUTIONS_UPLOAD_DIR)) fs.mkdirSync(SOLUTIONS_UPLOAD_DIR, { recursive: true });

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed to parse database.json, re-seeding:', err);
      }
    }

    this.seed();
    this.save();
  }

  private save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database.json:', err);
    }
  }

  private seed() {
    const passwordHash = hashPassword('codehelp123');
    const now = new Date();

    const users: User[] = [
      {
        id: 'u-alex',
        name: 'Alex',
        email: 'alex@codehelp.dev',
        passwordHash,
        score: 12,
        acceptedCount: 12,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      },
      {
        id: 'u-sam',
        name: 'Sam',
        email: 'sam@codehelp.dev',
        passwordHash,
        score: 9,
        acceptedCount: 9,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 25).toISOString(),
      },
      {
        id: 'u-bibek',
        name: 'Bibek',
        email: 'bibek@codehelp.dev',
        passwordHash,
        score: 7,
        acceptedCount: 7,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      },
      {
        id: 'u-sarah',
        name: 'Sarah',
        email: 'sarah@codehelp.dev',
        passwordHash,
        score: 4,
        acceptedCount: 4,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      },
      {
        id: 'u-david',
        name: 'David',
        email: 'david@codehelp.dev',
        passwordHash,
        score: 2,
        acceptedCount: 2,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      },
    ];

    // Create seed zip files
    const reactProjectZip = createZipBuffer([
      {
        name: 'package.json',
        content: JSON.stringify({ name: 'react-form-issue', version: '1.0.0', dependencies: { react: '^18.2.0' } }, null, 2),
      },
      {
        name: 'README.md',
        content: '# React Form Issue\n\nWhen clicking submit, form throws undefined preventDefault error.\nRun npm install and npm start.',
      },
      {
        name: 'src/App.jsx',
        content: `export default function App() {\n  const handleSubmit = (e) => {\n    // Bug: passed from child button directly without event\n    e.preventDefault();\n    console.log("Submitted");\n  };\n  return <form onSubmit={handleSubmit}><button type="submit">Submit</button></form>;\n}`,
      },
    ]);

    const jwtProjectZip = createZipBuffer([
      {
        name: 'package.json',
        content: JSON.stringify({ name: 'express-jwt-issue', version: '1.0.0', dependencies: { express: '^4.18.2' } }, null, 2),
      },
      {
        name: 'README.md',
        content: '# Express JWT Issue\n\nBearer token header is not being retrieved properly in auth middleware.',
      },
      {
        name: 'server.js',
        content: `const express = require('express');\nconst app = express();\napp.use((req, res, next) => {\n  const auth = req.headers['authorization'];\n  // Bug: split indexing\n  const token = auth && auth.split(' ')[0];\n  if (token !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });\n  next();\n});\napp.listen(4000);`,
      },
    ]);

    const solvedProjectZip = createZipBuffer([
      {
        name: 'tailwind.config.js',
        content: `module.exports = {\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],\n  theme: { extend: {} },\n  plugins: [],\n};`,
      },
      {
        name: 'README.md',
        content: '# Tailwind Docker Issue\n\nFixed missing purge paths in production build configuration.',
      },
    ]);

    const solvedFixZip = createZipBuffer([
      {
        name: 'tailwind.config.js',
        content: `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: [\n    "./index.html",\n    "./src/**/*.{js,ts,jsx,tsx,html}",\n    "./public/**/*.html"\n  ],\n  theme: { extend: {} },\n  plugins: [],\n};`,
      },
      {
        name: 'SOLUTION_NOTES.md',
        content: '# Fix Explanation\n\nUpdated tailwind.config.js content array to include public HTML and fixed Dockerfile multi-stage COPY paths so CSS purging does not strip valid classes.',
      },
    ]);

    const file1 = 'project_react_form_crash.zip';
    const file2 = 'project_jwt_auth_bug.zip';
    const file3 = 'project_tailwind_docker.zip';
    const fix3 = 'solution_tailwind_docker_fix.zip';

    fs.writeFileSync(path.resolve(PROJECTS_UPLOAD_DIR, file1), reactProjectZip);
    fs.writeFileSync(path.resolve(PROJECTS_UPLOAD_DIR, file2), jwtProjectZip);
    fs.writeFileSync(path.resolve(PROJECTS_UPLOAD_DIR, file3), solvedProjectZip);
    fs.writeFileSync(path.resolve(SOLUTIONS_UPLOAD_DIR, fix3), solvedFixZip);

    const problems: Problem[] = [
      {
        id: 'prob-1',
        title: 'React login form not submitting',
        description: 'The form works locally but fails after deployment with TypeError: Cannot read properties of undefined (reading preventDefault). We have tried changing onSubmit to onClick on the button but then form validation does not fire. Original project files attached in the ZIP.',
        posterId: 'u-bibek',
        posterName: 'Bibek',
        originalZipPath: file1,
        originalZipName: 'react-form-login.zip',
        originalZipSize: reactProjectZip.length,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
        status: 'open',
        acceptedSolutionId: null,
      },
      {
        id: 'prob-2',
        title: 'Express JWT middleware throwing 401 on valid Bearer token',
        description: 'During our hackathon backend deployment, authorization headers with "Bearer <token>" get parsed as undefined or rejected in our protected route chain. CORS headers allow Authorization. Need someone to fix the middleware logic and return user payload.',
        posterId: 'u-sarah',
        posterName: 'Sarah',
        originalZipPath: file2,
        originalZipName: 'express-jwt-auth.zip',
        originalZipSize: jwtProjectZip.length,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
        status: 'open',
        acceptedSolutionId: null,
      },
      {
        id: 'prob-3',
        title: 'Tailwind styles not building in production Docker container',
        description: 'Docker build compiles Vite app but production output has zero Tailwind utility classes. PostCSS config seems fine. The CSS bundle drops all utility classes during the container build stage.',
        posterId: 'u-david',
        posterName: 'David',
        originalZipPath: file3,
        originalZipName: 'tailwind-docker-repro.zip',
        originalZipSize: solvedProjectZip.length,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 28).toISOString(),
        status: 'solved',
        acceptedSolutionId: 'sol-3-alex',
      },
    ];

    const solutions: Solution[] = [
      {
        id: 'sol-3-alex',
        problemId: 'prob-3',
        solverId: 'u-alex',
        solverName: 'Alex',
        fixedZipPath: fix3,
        fixedZipName: 'tailwind-docker-fixed.zip',
        fixedZipSize: solvedFixZip.length,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 20).toISOString(),
        accepted: true,
      },
    ];

    this.data = { users, problems, solutions };
  }

  // User operations
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(name: string, email: string, password: string): User {
    const user: User = {
      id: 'u-' + crypto.randomUUID().slice(0, 8),
      name,
      email,
      passwordHash: hashPassword(password),
      score: 0,
      acceptedCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Problems operations
  getProblems(filter?: { status?: 'open' | 'solved' }): Problem[] {
    let list = [...this.data.problems];
    if (filter?.status) {
      list = list.filter((p) => p.status === filter.status);
    }
    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getProblemById(id: string): Problem | undefined {
    return this.data.problems.find((p) => p.id === id);
  }

  createProblem(params: {
    title: string;
    description: string;
    posterId: string;
    posterName: string;
    originalZipPath: string;
    originalZipName: string;
    originalZipSize: number;
  }): Problem {
    const problem: Problem = {
      id: 'prob-' + crypto.randomUUID().slice(0, 8),
      title: params.title,
      description: params.description,
      posterId: params.posterId,
      posterName: params.posterName,
      originalZipPath: params.originalZipPath,
      originalZipName: params.originalZipName,
      originalZipSize: params.originalZipSize,
      createdAt: new Date().toISOString(),
      status: 'open',
      acceptedSolutionId: null,
    };
    this.data.problems.push(problem);
    this.save();
    return problem;
  }

  // Solutions operations
  getSolutionsByProblemId(problemId: string): Solution[] {
    return this.data.solutions
      .filter((s) => s.problemId === problemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getSolutionById(id: string): Solution | undefined {
    return this.data.solutions.find((s) => s.id === id);
  }

  createSolution(params: {
    problemId: string;
    solverId: string;
    solverName: string;
    fixedZipPath: string;
    fixedZipName: string;
    fixedZipSize: number;
  }): Solution {
    const solution: Solution = {
      id: 'sol-' + crypto.randomUUID().slice(0, 8),
      problemId: params.problemId,
      solverId: params.solverId,
      solverName: params.solverName,
      fixedZipPath: params.fixedZipPath,
      fixedZipName: params.fixedZipName,
      fixedZipSize: params.fixedZipSize,
      createdAt: new Date().toISOString(),
      accepted: false,
    };
    this.data.solutions.push(solution);
    this.save();
    return solution;
  }

  acceptSolution(solutionId: string, currentUserId: string): { success: boolean; error?: string; problem?: Problem; solution?: Solution } {
    const solution = this.getSolutionById(solutionId);
    if (!solution) {
      return { success: false, error: 'Solution not found' };
    }

    const problem = this.getProblemById(solution.problemId);
    if (!problem) {
      return { success: false, error: 'Problem not found' };
    }

    // Only the problem poster can accept a solution
    if (problem.posterId !== currentUserId) {
      return { success: false, error: 'Only the original poster can accept a solution' };
    }

    // A solver cannot accept their own solution
    if (solution.solverId === currentUserId) {
      return { success: false, error: 'You cannot accept your own solution' };
    }

    // If problem already has an accepted solution, prevent another solution from being accepted
    if (problem.status === 'solved' || problem.acceptedSolutionId) {
      return { success: false, error: 'A solution has already been accepted for this problem' };
    }

    // Mark solution accepted
    solution.accepted = true;
    problem.status = 'solved';
    problem.acceptedSolutionId = solution.id;

    // Increase solver's score by exactly 1
    const solver = this.getUserById(solution.solverId);
    if (solver) {
      solver.score += 1;
      solver.acceptedCount += 1;
    }

    this.save();
    return { success: true, problem, solution };
  }

  // Leaderboard
  // Developers ranked by score, highest first.
  // Deterministic tie-breaker: acceptedCount desc, then createdAt asc
  getLeaderboard(): { rank: number; id: string; name: string; email: string; score: number; acceptedCount: number; createdAt: string }[] {
    const sorted = [...this.data.users].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.acceptedCount !== a.acceptedCount) {
        return b.acceptedCount - a.acceptedCount;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return sorted.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      score: user.score,
      acceptedCount: user.acceptedCount,
      createdAt: user.createdAt,
    }));
  }
}

export const db = new Database();
