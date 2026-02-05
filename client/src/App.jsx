import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from './components/Calendar.jsx';
import TaskPanel from './components/TaskPanel.jsx';
import Stats from './components/Stats';
import YouTubePlayer from './components/YoutubePlayer.jsx';
import Pomodoro from './components/Pomodoro.jsx';
import Auth from './components/Auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

function App() {
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);

  function getCurrentDate() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  useEffect(() => {
    // Listen for auth state changes
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken();
        setIdToken(token);
        setLoading(true);
        await fetchTasks(token);
        await fetchRewards(token);
        setLoading(false);
      } else {
        // not signed in
        setTasks([]);
        setRewards(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const getHeaders = (token, includeJson = false) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    // In development, automatically include a dev UID header so the server's
    // dev-fallback can accept requests when the Admin SDK isn't initialized.
    if (process.env.NODE_ENV !== 'production') {
      const devUid = process.env.REACT_APP_DEV_UID || (auth && auth.currentUser && auth.currentUser.uid);
      if (devUid) headers['x-dev-uid'] = devUid;
    }
    if (includeJson) headers['Content-Type'] = 'application/json';
    return headers;
  };

  const fetchTasks = async (token) => {
    try {
      const headers = getHeaders(token);
      const response = await fetch(`${API_BASE}/tasks`, { headers });
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.warn('Expected tasks array from /tasks, got:', data);
        setTasks([]);
      } else {
        setTasks(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchRewards = async (token) => {
    try {
      const headers = getHeaders(token);
      const response = await fetch(`${API_BASE}/rewards`, { headers });
      const data = await response.json();
      if (!data || typeof data !== 'object') {
        console.warn('Expected rewards object from /rewards, got:', data);
        setRewards(getDefaultRewardsFallback());
      } else {
        setRewards(data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const headers = getHeaders(idToken, true);
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData)
      });
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const headers = getHeaders(idToken, true);
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      
      // Refresh rewards if task was completed
      if (updatedTask.completed && updatedTask.reward) {
        await fetchRewards(idToken);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const headers = getHeaders(idToken);
      await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers
      });
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIdToken(null);
      setUser(null);
    } catch (err) {
      console.error('Sign out failed', err);
    }
  };

  const selectedDateTasks = tasks.filter(task => task.date === selectedDate);

  if (loading) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⚡
        </motion.div>
        <p>Loading QuestFlow...</p>
      </div>
    );
  }

  // Require auth to show app
  if (!user) {
    return (
      <div className="app">
        <div className="grid-bg" />
        <motion.header 
          className="app-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="logo-section">
            <motion.h1 
              className="app-title"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <span className="title-icon">⚡</span>
              QUESTFLOW
            </motion.h1>
            <p className="app-tagline">Level Up Your Life, One Quest at a Time</p>
          </div>
        </motion.header>

        <div className="auth-container">
          <Auth user={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="grid-bg" />
           <div className="header-actions">
         <p>Hi user {user?.email || 'Guest'} <button className="auth-btn" onClick={handleSignOut}>Sign out</button></p>
        </div>
      
      <Pomodoro />
      <motion.header 
        className="app-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="logo-section">
          <motion.h1 
            className="app-title"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <span className="title-icon">⚡</span>
            QUESTFLOW
          </motion.h1>
          <p className="app-tagline">Level Up Your Life, One Quest at a Time</p>
        </div>
   
      </motion.header>

      <Stats rewards={rewards} tasks={tasks} />

      <div className="main-content">
        <motion.div 
          className="calendar-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            tasksData={tasks}
          />
        </motion.div>

        <motion.div 
          className="tasks-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <TaskPanel
            date={selectedDate}
            tasks={selectedDateTasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        </motion.div>
        <div>
          <div className="youtube-player-section">
        <YouTubePlayer />
          </div>
        </div>
      </div>

      <motion.footer 
        className="app-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>🎮 Keep grinding, champion! Your progress is saved automatically.</p>
      </motion.footer>
    </div>
  );
}

// Fallback rewards object used when server returns invalid data in dev
function getDefaultRewardsFallback() {
  return {
    points: 0,
    badges: [],
    unlockedRewards: [],
    rewardPool: { messages: [], badges: [], unlockables: [] }
  };
}

export default App;
