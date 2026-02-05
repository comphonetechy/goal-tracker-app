import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Render sets PORT automatically

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase using provided web config
const firebaseConfig = {
  apiKey: "AIzaSyBs0CqFuhakRwGCG8zGEgxSiwwF3aO3mB4",
  authDomain: "goaltrackerapp-371fc.firebaseapp.com",
  databaseURL: "https://goaltrackerapp-371fc-default-rtdb.firebaseio.com",
  projectId: "goaltrackerapp-371fc",
  storageBucket: "goaltrackerapp-371fc.firebasestorage.app",
  messagingSenderId: "223651168030",
  appId: "1:223651168030:web:fc05ad7f755b3fe6d9d30f",
  measurementId: "G-18QJY22BVF"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const rdb = getDatabase(firebaseApp);

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
  try {
    const rewardsRef = ref(rdb, 'appData/rewards');
    const rewardsSnap = await get(rewardsRef);
    if (!rewardsSnap.exists()) {
      await set(rewardsRef, getDefaultRewards());
    }
  } catch (error) {
    console.error('Error initializing Realtime Database data:', error);
  }
}

// Helper functions (Realtime Database)
async function getAllTasks() {
  const snap = await get(ref(rdb, 'tasks'));
  const val = snap.exists() ? snap.val() : {};
  return Object.values(val);
}

async function getTasksByDate(date) {
  const q = query(ref(rdb, 'tasks'), orderByChild('date'), equalTo(date));
  const snap = await get(q);
  const val = snap.exists() ? snap.val() : {};
  return Object.values(val);
}

async function createTask(task) {
  await set(ref(rdb, `tasks/${task.id}`), task);
}

async function getTaskById(id) {
  const snap = await get(ref(rdb, `tasks/${id}`));
  return snap.exists() ? snap.val() : null;
}

async function setTaskById(id, task) {
  await set(ref(rdb, `tasks/${id}`), task);
}

async function deleteTaskById(id) {
  await remove(ref(rdb, `tasks/${id}`));
}

async function getRewardsData() {
  const snap = await get(ref(rdb, 'appData/rewards'));
  return snap.exists() ? snap.val() : null;
}

async function setRewardsData(data) {
  await set(ref(rdb, 'appData/rewards'), data);
}

async function updateRewardsData(partial) {
  await update(ref(rdb, 'appData/rewards'), partial);
}

// ------------------- API ROUTES -------------------

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Get tasks for a specific date
app.get('/api/tasks/:date', async (req, res) => {
  try {
    const dateTasks = await getTasksByDate(req.params.date);
    res.json(dateTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
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
    await createTask(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const existing = await getTaskById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const wasCompleted = existing.completed;
    const updatedTask = { ...existing, ...req.body };

    if (!wasCompleted && updatedTask.progress === 100 && !updatedTask.completed) {
      updatedTask.completed = true;
      updatedTask.completedAt = new Date().toISOString();
      const reward = await generateReward();
      updatedTask.reward = reward;
    }

    await setTaskById(req.params.id, updatedTask);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await deleteTaskById(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get rewards
app.get('/api/rewards', async (req, res) => {
  try {
    let data = await getRewardsData();
    if (!data) {
      data = getDefaultRewards();
      await setRewardsData(data);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read rewards' });
  }
});

// Reward generation
async function generateReward() {
  try {
    const rewardsData = (await getRewardsData()) || getDefaultRewards();
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

    await setRewardsData(rewardsData);
    return reward;
  } catch (error) {
    console.error('Error generating reward:', error);
    return { type: 'message', message: '🎉 Great job!' };
  }
}

// ------------------- SERVE REACT FRONTEND -------------------
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
