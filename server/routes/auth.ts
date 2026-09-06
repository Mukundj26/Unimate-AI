import { Router } from 'express';
import { db } from '../db.ts';

export const authRouter = Router();

// Simple bearer token / user ID resolver
export function getUserIdFromRequest(req: any): string {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  } else if (req.headers['x-user-id']) {
    token = String(req.headers['x-user-id']).trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)omni_token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]).trim();
    }
  }

  if (token) {
    // For demo/session token format: "token-<userId>" or directly userId
    if (token.startsWith('token-')) {
      const id = token.replace('token-', '');
      const user = db.findUserById(id);
      if (user) return user.id;
    } else {
      const user = db.findUserById(token);
      if (user) return user.id;
    }
  }
  return '';
}

authRouter.post('/register', (req, res) => {
  try {
    const { name, email, password, role = 'student', adminPasscode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';
    if (assignedRole === 'admin' && adminPasscode !== 'ADMIN2026') {
      return res.status(403).json({
        error: 'Invalid Admin Security Passcode. Enter ADMIN2026 to register an administrator account.',
      });
    }

    const user = db.createUser(name, email, password, assignedRole);
    const token = `token-${user.id}`;
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

authRouter.post('/login', (req, res) => {
  try {
    const { email, password, expectedRole, adminPasscode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = db.verifyUser(email, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials. For Faculty Admin, use admin@edu.nlp with password admin1234, or use the 1-Click Faculty Admin Sign-In button.',
      });
    }

    // Role-specific validation
    if (expectedRole === 'admin' && user.role !== 'admin') {
      // Check if student wants to elevate to admin with passcode or is Mukund
      if (adminPasscode === 'ADMIN2026' || user.email.toLowerCase().includes('mukund')) {
        db.updateUserRole(user.id, 'admin');
        user.role = 'admin';
      } else {
        return res.status(403).json({
          error: 'Access Denied: This account is registered as a Student. Enter Admin Passcode (ADMIN2026) to upgrade to Faculty Administrator, or sign in with admin@edu.nlp / admin1234.',
          isStudentRole: true,
        });
      }
    }

    const token = `token-${user.id}`;
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'student',
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

authRouter.get('/me', (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found or session expired' });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role || 'student',
      createdAt: user.createdAt,
    },
  });
});

// List all registered users stored in the database
authRouter.get('/users', (_req, res) => {
  try {
    const users = db.getAllUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Switch active user to an existing account
authRouter.post('/switch-user', (req, res) => {
  try {
    const { userId } = req.body;
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const token = `token-${user.id}`;
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'student',
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoint: update a user's role
authRouter.patch('/users/:userId/role', (req, res) => {
  try {
    const currentUserId = getUserIdFromRequest(req);
    const currentUser = db.findUserById(currentUserId);
    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
    }
    const { role } = req.body;
    if (role !== 'student' && role !== 'admin') {
      return res.status(400).json({ error: 'Role must be either student or admin' });
    }
    const updated = db.updateUserRole(req.params.userId, role);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoint: delete user
authRouter.delete('/users/:userId', (req, res) => {
  try {
    const currentUserId = getUserIdFromRequest(req);
    const currentUser = db.findUserById(currentUserId);
    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
    }
    if (req.params.userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot delete your own active administrator account' });
    }
    const deleted = db.deleteUser(req.params.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get detailed database and storage summary for the current user
authRouter.get('/database-summary', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const summary = db.getUserDatabaseSummary(userId);
    const globalStats = db.getDatabaseStats();
    res.json({
      ...summary,
      globalStats,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🎓 Admin endpoint: collect and retrieve ALL student records
authRouter.get('/admin/students', (req, res) => {
  try {
    const currentUserId = getUserIdFromRequest(req);
    const currentUser = db.findUserById(currentUserId);
    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required to inspect student records' });
    }
    const data = db.getAllStudentFullRecords();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🎓 Admin endpoint: export all collected student records
authRouter.get('/admin/students/export', (req, res) => {
  try {
    const currentUserId = getUserIdFromRequest(req);
    const currentUser = db.findUserById(currentUserId);
    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
    }
    const data = db.getAllStudentFullRecords();
    res.setHeader('Content-Disposition', 'attachment; filename="all_students_records_dossier.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
