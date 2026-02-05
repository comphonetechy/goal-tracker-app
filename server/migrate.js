import fs from 'fs/promises';
import path from 'path';
import admin from 'firebase-admin';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'server', 'serviceAccountKey.json');
async function initAdmin() {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({ credential: admin.credential.applicationDefault(), databaseURL: 'https://goaltrackerapp-371fc-default-rtdb.firebaseio.com' });
    } else {
      const sa = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(sa), databaseURL: 'https://goaltrackerapp-371fc-default-rtdb.firebaseio.com' });
    }
  } catch (err) {
    console.error('Failed to init admin sdk', err);
    process.exit(1);
  }
}

async function migrate(uid = 'migration-user') {
  await initAdmin();

  const dataDir = path.join(process.cwd(), 'data');
  const tasksPath = path.join(dataDir, 'tasks.json');
  const rewardsPath = path.join(dataDir, 'rewards.json');

  try {
    const tasksRaw = await fs.readFile(tasksPath, 'utf8');
    const tasksData = JSON.parse(tasksRaw).tasks || [];
    const tasksRef = admin.database().ref(`users/${uid}/tasks`);
    for (const task of tasksData) {
      await tasksRef.child(task.id).set(task);
    }
    console.log(`Migrated ${tasksData.length} tasks to users/${uid}/tasks`);
  } catch (err) {
    console.warn('No tasks to migrate or error reading tasks.json:', err.message);
  }

  try {
    const rewardsRaw = await fs.readFile(rewardsPath, 'utf8');
    const rewardsData = JSON.parse(rewardsRaw);
    await admin.database().ref(`users/${uid}/rewards`).set(rewardsData);
    console.log('Migrated rewards to users/${uid}/rewards');
  } catch (err) {
    console.warn('No rewards to migrate or error reading rewards.json:', err.message);
  }

  console.log('Migration complete');
  process.exit(0);
}

const uid = process.env.MIGRATE_UID || process.argv[2] || 'migration-user';
migrate(uid).catch(err => { console.error(err); process.exit(1); });