import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from './server/auth.ts';
import authRoutes from './server/routes/authRoutes.ts';
import problemRoutes from './server/routes/problemRoutes.ts';
import solutionRoutes from './server/routes/solutionRoutes.ts';
import leaderboardRoutes from './server/routes/leaderboardRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global auth extractor
  app.use(authMiddleware);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/problems', problemRoutes);
  app.use('/api', solutionRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'CodeHelp API', time: new Date().toISOString() });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeHelp server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
