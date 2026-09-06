import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/auth.ts';
import { filesRouter } from './server/routes/files.ts';
import { aiRouter } from './server/routes/ai.ts';
import { syncRouter } from './server/routes/sync.ts';
import { notesRouter, sharedNotesRouter } from './server/routes/notes.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/files', filesRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/shared-notes', sharedNotesRouter);
  app.use('/api/ai/notes', notesRouter);
  app.use('/api/ai/shared-notes', sharedNotesRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/sync', syncRouter);

  // Catch unmatched API routes to ensure they always return JSON rather than SPA index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
