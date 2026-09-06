import { Router } from 'express';
import { db } from '../db.ts';
import { getUserIdFromRequest } from './auth.ts';

export const notesRouter = Router();
export const sharedNotesRouter = Router();

// ==========================================
// 📚 NOTES SHARING APIS
// ==========================================

/**
 * POST /api/notes/:noteId/share
 * Shares a private note with the community.
 * Verifies authentication and ownership.
 */
notesRouter.post('/:noteId/share', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { noteId } = req.params;

    if (!noteId) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    const note = db.getNoteById(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Strict ownership verification:
    // Only the user who created the note can share it.
    if (note.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to share this note',
      });
    }

    const result = db.shareNote(noteId, userId);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to share note' });
  }
});

/**
 * DELETE /api/notes/:noteId/share
 * Unshares a note from the community.
 * Only the owner can unshare.
 */
notesRouter.delete('/:noteId/share', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { noteId } = req.params;

    if (!noteId) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    const note = db.getNoteById(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Verify ownership
    if (note.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden: You can only unshare your own notes',
      });
    }

    const result = db.unshareNote(noteId, userId);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to unshare note' });
  }
});

/**
 * GET /api/notes/shared-status
 * Returns array of note IDs currently shared by the user or globally
 */
notesRouter.get('/shared-status', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const userSharedIds = db.getSharedNoteIds(userId);
    const allSharedIds = db.getSharedNoteIds();
    res.json({
      userSharedIds,
      allSharedIds,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/shared-notes
 * Returns all notes shared by all users.
 * Does not expose passwords, hashes, or tokens.
 */
sharedNotesRouter.get('/', (req, res) => {
  try {
    const sharedNotes = db.getSharedNotes();
    // Return direct array and also support { sharedNotes: [...] }
    if (req.query.format === 'object') {
      return res.json({ sharedNotes });
    }
    return res.json(sharedNotes);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch shared notes' });
  }
});

/**
 * GET /api/shared-notes/:noteId
 * Returns the full content of a shared note.
 * Rejects access if the note has not been shared!
 */
sharedNotesRouter.get('/:noteId', (req, res) => {
  try {
    const { noteId } = req.params;
    if (!noteId) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    const sharedNote = db.getSharedNoteById(noteId);
    if (!sharedNote) {
      return res.status(404).json({
        error: 'Shared note not found or access denied. This note is either private or has not been shared.',
      });
    }

    return res.json(sharedNote);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch shared note' });
  }
});
