import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from './components/Calendar.jsx';
import TaskPanel from './components/TaskPanel.jsx';
import Stats from './components/Stats';
import YouTubePlayer from './components/YoutubePlayer.jsx';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [loading, setLoading] = useState(true);

  function getCurrentDate() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  useEffect(() => {
    fetchTasks();
    fetchRewards();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks`);
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch(`${API_BASE}/rewards`);
      const data = await response.json();
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      
      // Refresh rewards if task was completed
      if (updatedTask.completed && updatedTask.reward) {
        await fetchRewards();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
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

export default App;
