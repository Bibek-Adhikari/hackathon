import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { db, SOLUTIONS_UPLOAD_DIR } from '../db.ts';
import { uploadSolutionZip } from '../uploadConfig.ts';
import { AuthenticatedRequest, generateToken, requireAuth } from '../auth.ts';

const router = Router();

// GET /api/problems/:id/solutions
router.get('/problems/:id/solutions', (req, res) => {
  try {
    const problem = db.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const solutions = db.getSolutionsByProblemId(problem.id);
    return res.json({
      solutions: solutions.map((s) => ({
        id: s.id,
        problemId: s.problemId,
        solverId: s.solverId,
        solverName: s.solverName,
        createdAt: s.createdAt,
        accepted: s.accepted,
        fixedZipName: s.fixedZipName,
        fixedZipSize: s.fixedZipSize,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch solutions' });
  }
});

// POST /api/problems/:id/solutions
router.post('/problems/:id/solutions', (req: AuthenticatedRequest, res: Response) => {
  const problemId = req.params.id;
  const problem = db.getProblemById(problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  uploadSolutionZip.single('fixedZip')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed. Only ZIP (.zip) files are allowed.' });
    }

    try {
      const { name } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Fixed project ZIP file is required (.zip)' });
      }

      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== '.zip') {
        fs.unlink(file.path, () => {});
        return res.status(400).json({ error: 'Only ZIP (.zip) files are accepted.' });
      }

      let solverId = req.user ? req.user.id : '';
      let solverName = req.user ? req.user.name : (name && name.trim()) || 'Developer';
      let authUserToken: string | undefined = undefined;

      // If user not authenticated, auto-create solver account
      if (!solverId) {
        const fallbackName = (name && name.trim()) || 'Developer';
        const uniqueEmail = `solver_${Date.now()}@codehelp.dev`;
        const newUser = db.createUser(fallbackName, uniqueEmail, 'codehelp123');
        solverId = newUser.id;
        solverName = newUser.name;
        authUserToken = generateToken(newUser.id);
      }

      // Check if user is problem poster trying to solve their own problem
      // A poster can test submitting, but they won't be able to accept it
      const solution = db.createSolution({
        problemId: problem.id,
        solverId,
        solverName,
        fixedZipPath: path.basename(file.path),
        fixedZipName: file.originalname || 'fixed-project.zip',
        fixedZipSize: file.size,
      });

      return res.status(201).json({
        message: 'Your solution has been submitted.',
        solution: {
          id: solution.id,
          problemId: solution.problemId,
          solverId: solution.solverId,
          solverName: solution.solverName,
          createdAt: solution.createdAt,
          accepted: solution.accepted,
          fixedZipName: solution.fixedZipName,
          fixedZipSize: solution.fixedZipSize,
        },
        token: authUserToken,
        user: authUserToken ? { id: solverId, name: solverName, email: `${solverId}@codehelp.dev`, score: 0 } : undefined,
      });
    } catch (uploadErr: any) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(500).json({ error: uploadErr.message || 'Failed to submit solution' });
    }
  });
});

// POST /api/solutions/:id/accept
router.post('/solutions/:id/accept', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const solutionId = req.params.id;
    const currentUserId = req.user!.id;

    const result = db.acceptSolution(solutionId, currentUserId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      message: 'Solution accepted successfully! +1 point awarded to the solver.',
      problem: result.problem,
      solution: result.solution,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to accept solution' });
  }
});

// GET /api/solutions/:id/download
router.get('/solutions/:id/download', (req, res) => {
  try {
    const solution = db.getSolutionById(req.params.id);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    const filePath = path.resolve(SOLUTIONS_UPLOAD_DIR, solution.fixedZipPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fixed ZIP file not found on server' });
    }

    const downloadName = solution.fixedZipName.endsWith('.zip')
      ? solution.fixedZipName
      : `${solution.fixedZipName}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    const fileStream = fs.createReadStream(filePath);
    return fileStream.pipe(res);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to download solution file' });
  }
});

export default router;
