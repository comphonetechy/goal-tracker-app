import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Render sets PORT automatically

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK using service account or application default credentials
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'serviceAccountKey.json');
let adminInitialized = false;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: 'https://goaltrackerapp-371fc-default-rtdb.firebaseio.com'
    });
  } else {
    const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(sa),
      databaseURL: 'https://goaltrackerapp-371fc-default-rtdb.firebaseio.com'
    });
  }
  adminInitialized = true;
} catch (error) {
  // Don't crash server in dev — allow a development fallback mode
  console.warn('Warning: Firebase Admin SDK not initialized. Running in limited development mode. Auth and DB admin features will be disabled unless you provide service account credentials.');
  console.warn(error.message || error);
}

const rdb = adminInitialized ? admin.database() : null;

// Local JSON fallback paths for development when Admin SDK isn't available
const DATA_DIR = path.join(__dirname, '..', 'data');
const DEV_USERS_DIR = path.join(DATA_DIR, 'dev_users');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const REWARDS_FILE = path.join(DATA_DIR, 'rewards.json');

async function ensureDir(dir) {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function readJson(filePath, defaultValue = null) {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultValue;
  }
}

async function writeJson(filePath, obj) {
  await ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

// Default rewards structure helper
function getDefaultRewards() {
  return {
    points: 0,
    badges: [],
    unlockedRewards: [],
    rewardPool: {
      messages: [
        "🎉 Awesome work! You're crushing it!",
        "💪 You're unstoppable today!",
        "🌟 Legend! Keep the momentum going!",
        "🚀 To the moon! Amazing progress!",
        "🔥 On fire! Nothing can stop you now!",
        "⚡ Electric performance! Keep it up!",
        "🎯 Bullseye! You nailed it!",
        "👑 Royalty! You deserve this win!",
        "🏆 Champion mindset activated!",
        "✨ Magic! You make it look easy!"
      ],
      badges: [
        { id: 'first-win', name: 'First Victory', icon: '🥇', description: 'Complete your first task' },
        { id: 'streak-3', name: '3-Day Streak', icon: '🔥', description: 'Complete tasks for 3 days in a row' },
        { id: 'perfectionist', name: 'Perfectionist', icon: '💎', description: 'Complete 10 tasks at 100%' },
        { id: 'early-bird', name: 'Early Bird', icon: '🌅', description: 'Complete a task before 9 AM' },
        { id: 'night-owl', name: 'Night Owl', icon: '🦉', description: 'Complete a task after 9 PM' },
        { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', description: 'Complete 5 tasks in one day' },
        { id: 'marathon', name: 'Marathon Runner', icon: '🏃', description: 'Complete 50 tasks total' },
        { id: 'centurion', name: 'Centurion', icon: '💯', description: 'Reach 100 total points' }
      ],
      unlockables: [
        { id: 'theme-1', name: 'Dark Mode', icon: '🌙', type: 'theme' },
        { id: 'theme-2', name: 'Ocean Theme', icon: '🌊', type: 'theme' },
        { id: 'theme-3', name: 'Forest Theme', icon: '🌲', type: 'theme' },
        { id: 'avatar-1', name: 'Rocket Avatar', icon: '🚀', type: 'avatar' },
        { id: 'avatar-2', name: 'Star Avatar', icon: '⭐', type: 'avatar' },
        { id: 'title-1', name: 'Goal Crusher', icon: '💪', type: 'title' }
      ]
    }
  };
}

// Ensure rewards node exists in Realtime Database
async function initializeRealtimeData() {
  if (!adminInitialized) {
    console.warn('Skipping Realtime DB initialization — Admin SDK not initialized. Using local JSON fallback for development.');
    return;
  }

  try {
    const rewardsRef = admin.database().ref('appData/rewards');
    const rewardsSnap = await rewardsRef.get();
    if (!rewardsSnap.exists()) {
      await rewardsRef.set(getDefaultRewards());
    }
  } catch (error) {
    console.error('Error initializing Realtime Database data:', error);
  }
}

// Helper functions (Realtime Database using Admin SDK)
async function getAllTasks(uid) {
  if (adminInitialized) {
    const snap = await admin.database().ref(`users/${uid}/tasks`).get();
    const val = snap.exists() ? snap.val() : {};
    return Object.values(val);
  }

  // Dev fallback: use local JSON per-user file if present, otherwise fall back to global tasks.json
  const userTasksFile = path.join(DEV_USERS_DIR, `${uid}_tasks.json`);
  const userData = await readJson(userTasksFile, null);
  if (userData && Array.isArray(userData.tasks)) return userData.tasks;

  const global = await readJson(TASKS_FILE, { tasks: [] });
  return global.tasks || [];
}

async function getTasksByDate(uid, date) {
  if (adminInitialized) {
    const snap = await admin.database().ref(`users/${uid}/tasks`).orderByChild('date').equalTo(date).get();
    const val = snap.exists() ? snap.val() : {};
    return Object.values(val);
  }

  const tasks = await getAllTasks(uid);
  return tasks.filter(t => t.date === date);
}

async function createTask(uid, task) {
  if (adminInitialized) {
    await admin.database().ref(`users/${uid}/tasks/${task.id}`).set(task);
    return;
  }

  const userTasksFile = path.join(DEV_USERS_DIR, `${uid}_tasks.json`);
  const userData = await readJson(userTasksFile, { tasks: [] });
  userData.tasks = userData.tasks || [];
  userData.tasks.push(task);
  await writeJson(userTasksFile, userData);
}

async function getTaskById(uid, id) {
  if (adminInitialized) {
    const snap = await admin.database().ref(`users/${uid}/tasks/${id}`).get();
    return snap.exists() ? snap.val() : null;
  }

  const tasks = await getAllTasks(uid);
  return tasks.find(t => t.id === id) || null;
}

async function setTaskById(uid, id, task) {
  if (adminInitialized) {
    await admin.database().ref(`users/${uid}/tasks/${id}`).set(task);
    return;
  }

  const userTasksFile = path.join(DEV_USERS_DIR, `${uid}_tasks.json`);
  const userData = await readJson(userTasksFile, { tasks: [] });
  userData.tasks = userData.tasks || [];
  const idx = userData.tasks.findIndex(t => t.id === id);
  if (idx >= 0) userData.tasks[idx] = task;
  else userData.tasks.push(task);
  await writeJson(userTasksFile, userData);
}

async function deleteTaskById(uid, id) {
  if (adminInitialized) {
    await admin.database().ref(`users/${uid}/tasks/${id}`).remove();
    return;
  }

  const userTasksFile = path.join(DEV_USERS_DIR, `${uid}_tasks.json`);
  const userData = await readJson(userTasksFile, { tasks: [] });
  userData.tasks = (userData.tasks || []).filter(t => t.id !== id);
  await writeJson(userTasksFile, userData);
}

async function getRewardsData(uid) {
  if (adminInitialized) {
    const snap = await admin.database().ref(`users/${uid}/rewards`).get();
    return snap.exists() ? snap.val() : null;
  }

  const userRewardsFile = path.join(DEV_USERS_DIR, `${uid}_rewards.json`);
  const userData = await readJson(userRewardsFile, null);
  if (userData) return userData;

  // Fall back to global rewards.json as default
  const global = await readJson(REWARDS_FILE, getDefaultRewards());
  return global;
}

async function setRewardsData(uid, data) {
  if (adminInitialized) {
    await admin.database().ref(`users/${uid}/rewards`).set(data);
    return;
  }

  const userRewardsFile = path.join(DEV_USERS_DIR, `${uid}_rewards.json`);
  await writeJson(userRewardsFile, data);
}

async function updateRewardsData(uid, partial) {
  if (adminInitialized) {
    await admin.database().ref(`users/${uid}/rewards`).update(partial);
    return;
  }

  const current = await getRewardsData(uid) || getDefaultRewards();
  const merged = { ...current, ...partial };
  await setRewardsData(uid, merged);
}

// Auth middleware
async function authMiddleware(req, res, next) {
  if (adminInitialized) {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!idToken) return res.status(401).json({ error: 'Missing token' });
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Development fallback: allow using X-DEV-UID header or DEV_UID env var
  if (process.env.NODE_ENV !== 'production') {
    const devUid = req.headers['x-dev-uid'] || process.env.DEV_UID;
    if (devUid) {
      req.user = { uid: devUid, email: `${devUid}@dev.local` };
      return next();
    }
    return res.status(401).json({ error: 'Auth not configured on server. To use dev auth set X-DEV-UID header or DEV_UID env var.' });
  }

  return res.status(500).json({ error: 'Server auth not configured' });
}

// ------------------- API ROUTES -------------------

// Get all tasks (authenticated)
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await getAllTasks(req.user.uid);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Get tasks for a specific date (authenticated)
app.get('/api/tasks/:date', authMiddleware, async (req, res) => {
  try {
    const dateTasks = await getTasksByDate(req.user.uid, req.params.date);
    res.json(dateTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Create a new task (authenticated)
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const newTask = {
      id: Date.now().toString(),
      title: req.body.title,
      description: req.body.description || '',
      date: req.body.date,
      progress: 0,
      category: req.body.category || 'general',
      estimatedTime: req.body.estimatedTime || 25,
      elapsedTime: req.body.elapsedTime || 0,
      createdAt: new Date().toISOString(),
      completed: false
    };
    await createTask(req.user.uid, newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task (authenticated)
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await getTaskById(req.user.uid, req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const wasCompleted = existing.completed;
    const updatedTask = { ...existing, ...req.body };

    if (!wasCompleted && updatedTask.progress === 100 && !updatedTask.completed) {
      updatedTask.completed = true;
      updatedTask.completedAt = new Date().toISOString();
      const reward = await generateReward(req.user.uid);
      updatedTask.reward = reward;
    }

    await setTaskById(req.user.uid, req.params.id, updatedTask);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task (authenticated)
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    await deleteTaskById(req.user.uid, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get rewards (authenticated)
app.get('/api/rewards', authMiddleware, async (req, res) => {
  try {
    let data = await getRewardsData(req.user.uid);
    if (!data) {
      data = getDefaultRewards();
      await setRewardsData(req.user.uid, data);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read rewards' });
  }
});

// Reward generation
async function generateReward(uid) {
  try {
    const rewardsData = (await getRewardsData(uid)) || getDefaultRewards();
    const rewardPool = rewardsData.rewardPool || getDefaultRewards().rewardPool;

    const types = ['points', 'message', 'badge', 'unlockable'];
    const weights = [40, 30, 20, 10];
    const random = Math.random() * 100;

    let rewardType;
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        rewardType = types[i];
        break;
      }
    }

    let reward = { type: rewardType };

    switch (rewardType) {
      case 'points':
        const points = Math.floor(Math.random() * 50) + 10;
        rewardsData.points += points;
        reward.value = points;
        reward.message = `🎁 +${points} points!`;
        break;
      case 'message':
        reward.message = rewardPool.messages[Math.floor(Math.random() * rewardPool.messages.length)];
        break;
      case 'badge':
        const availableBadges = rewardPool.badges.filter(b => !rewardsData.badges.includes(b.id));
        if (availableBadges.length > 0) {
          const badge = availableBadges[Math.floor(Math.random() * availableBadges.length)];
          rewardsData.badges.push(badge.id);
          reward.badge = badge;
          reward.message = `🏅 New badge unlocked: ${badge.name}!`;
        } else {
          const pts = Math.floor(Math.random() * 50) + 10;
          rewardsData.points += pts;
          reward.type = 'points';
          reward.value = pts;
          reward.message = `🎁 +${pts} points!`;
        }
        break;
      case 'unlockable':
        const availableUnlockables = rewardPool.unlockables.filter(u => !rewardsData.unlockedRewards.includes(u.id));
        if (availableUnlockables.length > 0) {
          const unlockable = availableUnlockables[Math.floor(Math.random() * availableUnlockables.length)];
          rewardsData.unlockedRewards.push(unlockable.id);
          reward.unlockable = unlockable;
          reward.message = `🎊 Unlocked: ${unlockable.name}!`;
        } else {
          const pts = Math.floor(Math.random() * 50) + 10;
          rewardsData.points += pts;
          reward.type = 'points';
          reward.value = pts;
          reward.message = `🎁 +${pts} points!`;
        }
        break;
    }

    await setRewardsData(uid, rewardsData);
    return reward;
  } catch (error) {
    console.error('Error generating reward:', error);
    return { type: 'message', message: '🎉 Great job!' };
  }
}

// ------------------- SERVE REACT FRONTEND -------------------
app.get('/api/_health', (req, res) => res.json({ ok: true, adminInitialized }));
const CLIENT_BUILD_PATH = path.join(__dirname, '../client/build'); // CRA build folder
app.use(express.static(CLIENT_BUILD_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// ------------------- START SERVER -------------------
initializeRealtimeData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
