import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { db, PROJECTS_UPLOAD_DIR } from '../db.ts';
import { uploadProjectZip } from '../uploadConfig.ts';
import { AuthenticatedRequest, generateToken } from '../auth.ts';

const router = Router();

// GET /api/problems
router.get('/', (req, res) => {
  try {
    const status = req.query.status as 'open' | 'solved' | undefined;
    const filter = status && (status === 'open' || status === 'solved') ? { status } : undefined;
    const problems = db.getProblems(filter);

    // Format problems for listing
    const formatted = problems.map((p) => {
      const solutions = db.getSolutionsByProblemId(p.id);
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        posterId: p.posterId,
        posterName: p.posterName,
        createdAt: p.createdAt,
        status: p.status,
        solutionsCount: solutions.length,
        originalZipName: p.originalZipName,
        originalZipSize: p.originalZipSize,
      };
    });

    return res.json({ problems: formatted });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// GET /api/problems/:id
router.get('/:id', (req, res) => {
  try {
    const problem = db.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const solutions = db.getSolutionsByProblemId(problem.id);
    const acceptedSolution = problem.acceptedSolutionId ? db.getSolutionById(problem.acceptedSolutionId) : null;

    return res.json({
      problem: {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        posterId: problem.posterId,
        posterName: problem.posterName,
        createdAt: problem.createdAt,
        status: problem.status,
        originalZipName: problem.originalZipName,
        originalZipSize: problem.originalZipSize,
        acceptedSolutionId: problem.acceptedSolutionId,
        acceptedSolverName: acceptedSolution ? acceptedSolution.solverName : null,
      },
      solutionsCount: solutions.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch problem details' });
  }
});

// POST /api/problems
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  uploadProjectZip.single('projectZip')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed. Only ZIP (.zip) files are allowed.' });
    }

    try {
      const { name, title, description } = req.body;
      const file = req.file;

      if (!title || !title.trim()) {
        if (file) fs.unlink(file.path, () => {});
        return res.status(400).json({ error: 'Problem title is required' });
      }

      if (!description || !description.trim()) {
        if (file) fs.unlink(file.path, () => {});
        return res.status(400).json({ error: 'Description is required' });
      }

      if (!file) {
        return res.status(400).json({ error: 'Project ZIP file is required (.zip)' });
      }

      // Check if file is a zip
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== '.zip') {
        fs.unlink(file.path, () => {});
        return res.status(400).json({ error: 'Only ZIP (.zip) files are accepted.' });
      }

      let posterId = req.user ? req.user.id : '';
      let posterName = req.user ? req.user.name : (name && name.trim()) || 'Anonymous Developer';
      let authUserToken: string | undefined = undefined;

      // If user is not authenticated, check if they provided a name or create a guest/account session
      if (!posterId) {
        const fallbackName = (name && name.trim()) || 'Developer';
        const uniqueEmail = `poster_${Date.now()}@codehelp.dev`;
        const newUser = db.createUser(fallbackName, uniqueEmail, 'codehelp123');
        posterId = newUser.id;
        posterName = newUser.name;
        authUserToken = generateToken(newUser.id);
      }

      const problem = db.createProblem({
        title: title.trim(),
        description: description.trim(),
        posterId,
        posterName,
        originalZipPath: path.basename(file.path),
        originalZipName: file.originalname || 'project.zip',
        originalZipSize: file.size,
      });

      return res.status(201).json({
        message: 'Your problem has been posted.',
        problem: {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          posterId: problem.posterId,
          posterName: problem.posterName,
          createdAt: problem.createdAt,
          status: problem.status,
          originalZipName: problem.originalZipName,
          originalZipSize: problem.originalZipSize,
        },
        token: authUserToken, // If newly created session
        user: authUserToken ? { id: posterId, name: posterName, email: `${posterId}@codehelp.dev`, score: 0 } : undefined,
      });
    } catch (uploadErr: any) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(500).json({ error: uploadErr.message || 'Failed to post problem' });
    }
  });
});

// GET /api/problems/:id/download
router.get('/:id/download', (req, res) => {
  try {
    const problem = db.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const filePath = path.resolve(PROJECTS_UPLOAD_DIR, problem.originalZipPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ZIP file not found on server' });
    }

    // Set download headers securely
    const downloadName = problem.originalZipName.endsWith('.zip')
      ? problem.originalZipName
      : `${problem.originalZipName}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    const fileStream = fs.createReadStream(filePath);
    return fileStream.pipe(res);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to download project file' });
  }
});

export default router;
