import React from 'react';
import { motion } from 'framer-motion';
import './Stats.css';

const Stats = ({ rewards, tasks }) => {
  if (!rewards) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const earnedBadges = rewards.badges.map(badgeId => 
    rewards.rewardPool.badges.find(b => b.id === badgeId)
  ).filter(Boolean);

  const unlockedItems = rewards.unlockedRewards.map(itemId =>
    rewards.rewardPool.unlockables.find(u => u.id === itemId)
  ).filter(Boolean);

  return (
    <div className="stats-container">
      <motion.div 
        className="stats-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-icon">⚡</div>
        <div className="stat-value">{rewards.points}</div>
        <div className="stat-label">POWER POINTS</div>
      </motion.div>

      <motion.div 
        className="stats-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-icon">✓</div>
        <div className="stat-value">{completedTasks}</div>
        <div className="stat-label">QUESTS COMPLETED</div>
      </motion.div>

      <motion.div 
        className="stats-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="stat-icon">🎯</div>
        <div className="stat-value">{completionRate}%</div>
        <div className="stat-label">SUCCESS RATE</div>
      </motion.div>

      <motion.div 
        className="stats-card badges-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="badges-header">
          <span className="stat-icon">🏅</span>
          <span className="badges-count">{earnedBadges.length}/{rewards.rewardPool.badges.length}</span>
        </div>
        <div className="stat-label">BADGES EARNED</div>
        
        {earnedBadges.length > 0 && (
          <div className="badges-showcase">
            {earnedBadges.slice(0, 3).map((badge, index) => (
              <motion.div
                key={badge.id}
                className="badge-item"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                title={badge.description}
              >
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </motion.div>
            ))}
            {earnedBadges.length > 3 && (
              <div className="badge-more">+{earnedBadges.length - 3} more</div>
            )}
          </div>
        )}
      </motion.div>

      {unlockedItems.length > 0 && (
        <motion.div 
          className="stats-card unlockables-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="stat-icon">🎁</div>
          <div className="stat-label">UNLOCKED REWARDS</div>
          <div className="unlockables-list">
            {unlockedItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="unlockable-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <span className="unlockable-icon">{item.icon}</span>
                <span className="unlockable-name">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Stats;
