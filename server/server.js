import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Render sets PORT automatically

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const REWARDS_FILE = path.join(DATA_DIR, 'rewards.json');

// Initialize data files if they don't exist
async function initializeDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize tasks file
    try {
      await fs.access(TASKS_FILE);
    } catch {
      await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks: [] }, null, 2));
    }
    
    // Initialize rewards file with default rewards
    try {
      await fs.access(REWARDS_FILE);
    } catch {
      const defaultRewards = {
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
      await fs.writeFile(REWARDS_FILE, JSON.stringify(defaultRewards, null, 2));
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Helper functions
async function readJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ------------------- API ROUTES -------------------

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const data = await readJSON(TASKS_FILE);
    res.json(data.tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Get tasks for a specific date
app.get('/api/tasks/:date', async (req, res) => {
  try {
    const data = await readJSON(TASKS_FILE);
    const dateTasks = data.tasks.filter(task => task.date === req.params.date);
    res.json(dateTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const data = await readJSON(TASKS_FILE);
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
    data.tasks.push(newTask);
    await writeJSON(TASKS_FILE, data);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const data = await readJSON(TASKS_FILE);
    const taskIndex = data.tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
    
    const wasCompleted = data.tasks[taskIndex].completed;
    const updatedTask = { ...data.tasks[taskIndex], ...req.body };
    
    if (!wasCompleted && updatedTask.progress === 100 && !updatedTask.completed) {
      updatedTask.completed = true;
      updatedTask.completedAt = new Date().toISOString();
      const reward = await generateReward();
      updatedTask.reward = reward;
    }
    
    data.tasks[taskIndex] = updatedTask;
    await writeJSON(TASKS_FILE, data);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const data = await readJSON(TASKS_FILE);
    data.tasks = data.tasks.filter(t => t.id !== req.params.id);
    await writeJSON(TASKS_FILE, data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get rewards
app.get('/api/rewards', async (req, res) => {
  try {
    const data = await readJSON(REWARDS_FILE);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read rewards' });
  }
});

// Reward generation
async function generateReward() {
  try {
    const rewardsData = await readJSON(REWARDS_FILE);
    const rewardPool = rewardsData.rewardPool;

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

    await writeJSON(REWARDS_FILE, rewardsData);
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
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
