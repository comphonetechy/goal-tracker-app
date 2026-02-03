import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Calendar.css';

const Calendar = ({ selectedDate, onDateSelect, tasksData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const days = [];
  
  // Empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  const getTasksForDate = (dateStr) => {
    return tasksData.filter(task => task.date === dateStr);
  };

  const getCompletionStatus = (dateStr) => {
    const tasks = getTasksForDate(dateStr);
    if (tasks.length === 0) return null;
    
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <motion.button
          className="nav-btn"
          onClick={handlePrevMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ◄
        </motion.button>
        <h2 className="month-title">
          {monthNames[month]} {year}
        </h2>
        <motion.button
          className="nav-btn"
          onClick={handleNextMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ►
        </motion.button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-label">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day empty" />;
          }

          const dateStr = formatDate(year, month, day);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const status = getCompletionStatus(dateStr);

          return (
            <motion.div
              key={dateStr}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${status ? 'has-tasks' : ''}`}
              onClick={() => onDateSelect(dateStr)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
            >
              <span className="day-number">{day}</span>
              
              {status && (
                <div className="task-indicator">
                  <div 
                    className="completion-ring"
                    style={{
                      background: `conic-gradient(
                        var(--accent-cyan) ${status.percentage * 3.6}deg,
                        rgba(0, 240, 255, 0.1) ${status.percentage * 3.6}deg
                      )`
                    }}
                  >
                    <div className="inner-ring">
                      {status.completed}/{status.total}
                    </div>
                  </div>
                </div>
              )}
              
              {isToday && <div className="today-marker">TODAY</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
