import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { db, UPLOADS_DIR } from '../db.ts';
import { getUserIdFromRequest } from './auth.ts';

export const filesRouter = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) return '';
    const buffer = fs.readFileSync(filePath);

    // 1. Check for PDF documents
    if (
      mimeType.includes('pdf') ||
      filePath.toLowerCase().endsWith('.pdf') ||
      buffer.subarray(0, 5).toString() === '%PDF-'
    ) {
      try {
        const parser = new PDFParse({ data: buffer });
        const parsed = await parser.getText();
        if (parsed && parsed.text && parsed.text.trim()) {
          return parsed.text.slice(0, 50000);
        }
      } catch (pdfErr) {
        console.warn('PDF parser warning for', filePath, pdfErr);
      }
    }

    // 2. For plain text, markdown, json, csv, code files
    if (
      mimeType.includes('text') ||
      mimeType.includes('json') ||
      mimeType.includes('javascript') ||
      mimeType.includes('typescript') ||
      mimeType.includes('markdown') ||
      filePath.endsWith('.txt') ||
      filePath.endsWith('.md') ||
      filePath.endsWith('.json') ||
      filePath.endsWith('.csv') ||
      filePath.endsWith('.py') ||
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.js')
    ) {
      return buffer.toString('utf-8').slice(0, 50000);
    }

    // 3. For binary or other formats, extract clean printable strings
    const printable = buffer.toString('latin1').replace(/[^\x20-\x7E\t\r\n]/g, ' ');
    const clean = printable.replace(/\s+/g, ' ').trim();
    return clean.slice(0, 20000);
  } catch (err) {
    console.error('Error extracting text from file:', err);
  }
  return '';
}

// Upload single or multiple files (and folder uploads)
filesRouter.post('/upload', upload.array('files', 50), async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const uploadedFiles = req.files as Express.Multer.File[];
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const relativePaths: string[] = [];
    if (req.body.relativePaths) {
      try {
        const parsed = JSON.parse(req.body.relativePaths);
        if (Array.isArray(parsed)) {
          relativePaths.push(...parsed);
        }
      } catch {
        // Ignore JSON error
      }
    }

    const defaultFolderPath = req.body.folderPath || '/';
    const results = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      let assignedFolder = defaultFolderPath;

      // Check if folder path is provided via webkitRelativePath
      if (relativePaths[i]) {
        const dirName = path.dirname(relativePaths[i]);
        if (dirName && dirName !== '.') {
          assignedFolder = `/${dirName}`.replace(/\/+/g, '/');
          // Automatically ensure folder exists
          db.createFolder(userId, path.basename(dirName), path.dirname(assignedFolder) || '/');
        }
      }

      const filePath = path.join(UPLOADS_DIR, file.filename);
      const textContent = await extractTextFromFile(filePath, file.mimetype);

      const { file: savedFile, isNewVersion } = db.addOrVersionFile({
        userId,
        originalName: file.originalname,
        storedFilename: file.filename,
        folderPath: assignedFolder,
        size: file.size,
        mimeType: file.mimetype,
        textContent,
        tags: [path.extname(file.originalname).replace('.', '').toLowerCase() || 'document'],
      });

      results.push({
        ...savedFile,
        isNewVersion,
      });
    }

    res.json({
      success: true,
      count: results.length,
      files: results,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// List files and folders
filesRouter.get('/', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const folderPath = req.query.folderPath as string | undefined;
    const files = db.getFiles(userId, folderPath);
    const folders = db.getFolders(userId);

    res.json({
      files,
      folders,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list files' });
  }
});

// Explicit folders endpoint
filesRouter.get('/folders', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const folders = db.getFolders(userId);
    res.json({ folders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list folders' });
  }
});

// Create folder
filesRouter.post('/folder', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { name, parentPath = '/' } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    const folder = db.createFolder(userId, name, parentPath);
    res.json({ success: true, folder });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create folder' });
  }
});

// Create folder alias
filesRouter.post('/create-folder', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { name, parentPath = '/' } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    const folder = db.createFolder(userId, name, parentPath);
    res.json({ success: true, folder });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create folder' });
  }
});

// Get file details with version history
filesRouter.get('/:id', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const file = db.getFileById(req.params.id, userId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ file });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Rollback file to prior version
filesRouter.post('/:id/rollback', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { targetVersion } = req.body;
    if (!targetVersion) {
      return res.status(400).json({ error: 'targetVersion is required' });
    }
    const updated = db.rollbackFileVersion(req.params.id, userId, Number(targetVersion));
    res.json({ success: true, file: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Rollback failed' });
  }
});

// Download file (current or specific version)
filesRouter.get('/:id/download', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const file = db.getFileById(req.params.id, userId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    let targetFilename = file.storedFilename;
    const requestedVersion = req.query.version ? Number(req.query.version) : null;
    if (requestedVersion && requestedVersion !== file.version) {
      const historical = file.versions.find(v => v.version === requestedVersion);
      if (historical) {
        targetFilename = historical.storedFilename;
      }
    }

    const filePath = path.join(UPLOADS_DIR, targetFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File content not found on disk' });
    }

    res.download(filePath, file.originalName);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Download error' });
  }
});

// Delete file
filesRouter.delete('/:id', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const success = db.deleteFile(req.params.id, userId);
    if (!success) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
