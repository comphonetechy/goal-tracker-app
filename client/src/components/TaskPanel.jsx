import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TaskPanel.css';

const TaskPanel = ({ date, tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'general',
    estimatedTime: 25 // default 25 minutes (Pomodoro style)
  });
  
  // Timer states for each task
  const [timers, setTimers] = useState({});
  const intervalRefs = useRef({});
  const audioRef = useRef(null);

  const categories = ['general', 'learning', 'fitness', 'creative', 'work', 'personal'];
  const categoryColors = {
    general: 'var(--accent-cyan)',
    learning: '#9c27b0',
    fitness: '#4caf50',
    creative: '#ff9800',
    work: '#2196f3',
    personal: '#e91e63'
  };

  // Initialize timers for tasks
  useEffect(() => {
    const newTimers = {};
    tasks.forEach(task => {
      if (!timers[task.id]) {
        newTimers[task.id] = {
          elapsed: task.elapsedTime || 0,
          isRunning: false,
          estimatedTime: task.estimatedTime || 25
        };
      } else {
        newTimers[task.id] = timers[task.id];
      }
    });
    setTimers(newTimers);
  }, [tasks.length]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  // Sound effects
  const playSound = (type) => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    switch(type) {
      case 'start':
        oscillator.frequency.value = 440; // A4
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
        break;
      case 'pause':
        oscillator.frequency.value = 330; // E4
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
        break;
      case 'complete':
        // Victory sound - three ascending notes
        [523, 659, 784].forEach((freq, i) => {
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.connect(gain);
          gain.connect(context.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, context.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + i * 0.15 + 0.3);
          osc.start(context.currentTime + i * 0.15);
          osc.stop(context.currentTime + i * 0.15 + 0.3);
        });
        break;
      case 'tick':
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.05, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.05);
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      onAddTask({
        ...newTask,
        date,
        elapsedTime: 0
      });
      setNewTask({ title: '', description: '', category: 'general', estimatedTime: 25 });
      setIsAdding(false);
    }
  };

  const toggleTimer = (taskId) => {
    const timer = timers[taskId];
    if (!timer) return;

    if (timer.isRunning) {
      // Pause timer
      clearInterval(intervalRefs.current[taskId]);
      playSound('pause');
      setTimers(prev => ({
        ...prev,
        [taskId]: { ...prev[taskId], isRunning: false }
      }));
    } else {
      // Start timer
      playSound('start');
      setTimers(prev => ({
        ...prev,
        [taskId]: { ...prev[taskId], isRunning: true }
      }));

      intervalRefs.current[taskId] = setInterval(() => {
        setTimers(prev => {
          const newElapsed = prev[taskId].elapsed + 1;
          const estimatedSeconds = prev[taskId].estimatedTime * 60;
          const progress = Math.min(100, Math.round((newElapsed / estimatedSeconds) * 100));
          
          // Update task in database
          onUpdateTask(taskId, { 
            progress, 
            elapsedTime: newElapsed 
          });

          // Check if completed
          if (progress >= 100 && prev[taskId].elapsed < estimatedSeconds) {
            clearInterval(intervalRefs.current[taskId]);
            playSound('complete');
            return {
              ...prev,
              [taskId]: { ...prev[taskId], elapsed: newElapsed, isRunning: false }
            };
          }

          // Play tick sound every minute
          if (newElapsed % 60 === 0) {
            playSound('tick');
          }

          return {
            ...prev,
            [taskId]: { ...prev[taskId], elapsed: newElapsed }
          };
        });
      }, 1000);
    }
  };

  const resetTimer = (taskId) => {
    clearInterval(intervalRefs.current[taskId]);
    playSound('pause');
    setTimers(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], elapsed: 0, isRunning: false }
    }));
    onUpdateTask(taskId, { progress: 0, elapsedTime: 0 });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Whether any timer is currently running (used to disable other start buttons)
  const isAnyRunning = Object.values(timers).some(t => t.isRunning);

  return (
    <div className="task-panel">
      <div className="panel-header">
        <div className="date-display">
          <span className="date-icon">📅</span>
          <h3>{formatDate(date)}</h3>
        </div>
        <motion.button
          className="add-task-btn"
          onClick={() => setIsAdding(!isAdding)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAdding ? '✕ CANCEL' : '+ NEW QUEST'}
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            className="task-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder="Quest Title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="task-input"
              autoFocus
            />
            <textarea
              placeholder="Quest Description (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="task-textarea"
              rows="3"
            />
            <div className="time-input-section">
              <label htmlFor="estimatedTime" className="time-label">
                ⏱️ Estimated Time (minutes):
              </label>
              <input
                id="estimatedTime"
                type="number"
                min="1"
                max="480"
                value={newTask.estimatedTime}
                onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 25 })}
                className="time-input"
              />
            </div>
            <div className="category-selector">
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  type="button"
                  className={`category-btn ${newTask.category === cat ? 'active' : ''}`}
                  onClick={() => setNewTask({ ...newTask, category: cat })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    '--cat-color': categoryColors[cat]
                  }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🚀 START QUEST
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="tasks-list">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">🎯</div>
              <p>No quests for this day</p>
              <p className="empty-hint">Click "NEW QUEST" to begin!</p>
            </motion.div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                className={`task-card ${task.completed ? 'completed' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  '--cat-color': categoryColors[task.category]
                }}
              >
                <div className="task-header">
                  <div className="task-title-section">
                    <span className="category-badge" style={{ background: categoryColors[task.category] }}>
                      {task.category}
                    </span>
                    <h4 className="task-title">{task.title}</h4>
                  </div>
                  <motion.button
                    className="delete-btn"
                    onClick={() => onDeleteTask(task.id)}
                    disabled={isAnyRunning}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="timer-section">
                  <div className="timer-header">
                    <span className="timer-label">⏱️ TIMER</span>
                    <div className="timer-stats">
                      <span className="estimated-time">
                        Target: {task.estimatedTime || 25}min
                      </span>
                    </div>
                  </div>

                  <div className="timer-display">
                    <motion.div 
                      className="time-value"
                      animate={{ 
                        scale: timers[task.id]?.isRunning ? [1, 1.02, 1] : 1 
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: timers[task.id]?.isRunning ? Infinity : 0 
                      }}
                    >
                      {formatTime(timers[task.id]?.elapsed || 0)}
                    </motion.div>
                    {timers[task.id]?.isRunning && (
                      <motion.div 
                        className="pulse-indicator"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ⚡ ACTIVE
                      </motion.div>
                    )}
                  </div>

                  <div className="timer-controls">
                    <motion.button
                      className={`timer-btn ${timers[task.id]?.isRunning ? 'pause' : 'start'}`}
                      onClick={() => toggleTimer(task.id)}
                      disabled={
                        task.completed || (isAnyRunning && !timers[task.id]?.isRunning)
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {timers[task.id]?.isRunning ? '⏸️ PAUSE' : '▶️ START'}
                    </motion.button>
                    <motion.button
                      className="timer-btn reset"
                      onClick={() => resetTimer(task.id)}
                      disabled={task.completed}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🔄 RESET
                    </motion.button>
                  </div>

                  <div className="progress-bar-container">
                    <motion.div
                      className="progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{
                        background: task.completed
                          ? 'var(--accent-green)'
                          : `linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta))`
                      }}
                    >
                      {task.progress > 10 && (
                        <span className="progress-text">{task.progress}%</span>
                      )}
                    </motion.div>
                  </div>

                  {task.completed && task.reward && (
                    <motion.div
                      className="reward-display"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="reward-content">
                        <span className="reward-icon">🎁</span>
                        <span className="reward-message">{task.reward.message}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {task.completed && (
                  <motion.div
                    className="completion-badge"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    ✓ QUEST COMPLETE
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskPanel;
