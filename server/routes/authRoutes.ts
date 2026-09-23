import { Router } from 'express';
import { db, hashPassword } from '../db.ts';
import { generateToken, revokeToken, AuthenticatedRequest, requireAuth } from '../auth.ts';

const router = Router();

// Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const existing = db.getUserByEmail(email.trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const user = db.createUser(name.trim(), email.trim(), password);
    const token = generateToken(user.id);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        score: user.score,
        acceptedCount: user.acceptedCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    return res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        score: user.score,
        acceptedCount: user.acceptedCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Logout
router.post('/logout', (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] as string);
  if (token) {
    revokeToken(token);
  }
  return res.json({ message: 'Logged out successfully' });
});

// Current User
router.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      score: req.user.score,
      acceptedCount: req.user.acceptedCount,
    },
  });
});

// Demo switch
router.post('/switch-demo', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = generateToken(user.id);
  return res.json({
    message: `Switched to ${user.name}`,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      score: user.score,
      acceptedCount: user.acceptedCount,
    },
  });
});

// Demo users list for testing
router.get('/demo-users', (_req, res) => {
  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    score: u.score,
    acceptedCount: u.acceptedCount,
  }));
  return res.json({ users });
});

export default router;
