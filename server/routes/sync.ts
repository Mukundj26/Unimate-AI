import { Router } from 'express';
import { db, SyncEvent } from '../db.ts';
import { getUserIdFromRequest } from './auth.ts';

export const syncRouter = Router();

syncRouter.get('/events', (req, res) => {
  const userId = getUserIdFromRequest(req);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', userId, timestamp: new Date().toISOString() })}\n\n`);

  const unsubscribe = db.onSync((event: SyncEvent) => {
    // Only send events relevant to this user or global events like academic papers
    if (event.userId === userId || event.type === 'academic_shared') {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });

  // Keep-alive heartbeat ping every 25 seconds
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
});
