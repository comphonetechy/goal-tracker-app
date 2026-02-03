# 🔄 Migration Guide: v1.0 → v2.0 (Timer Upgrade)

## Overview
Version 2.0 introduces a timer-based tracking system to replace manual percentage input. This guide helps you understand what's changed and how to upgrade.

## ✨ What's New?

### Timer-Based Progress
- **Old**: Manual percentage input (0-100%)
- **New**: Automatic progress based on elapsed time vs estimated time

### Sound Effects
- **New Feature**: Audio feedback for timer actions
- No migration needed - works automatically

## 📦 Upgrading Steps

### 1. Backup Your Data (Recommended)
```bash
# Navigate to your project
cd goal-tracker-app

# Backup your tasks
cp data/tasks.json data/tasks.json.backup
cp data/rewards.json data/rewards.json.backup
```

### 2. Update Files
Replace the following files with the new versions:
- `client/src/components/TaskPanel.jsx`
- `client/src/components/TaskPanel.css`
- `server/server.js`

Or download the complete v2.0 package.

### 3. Install Dependencies (if needed)
```bash
# No new dependencies required!
# The Web Audio API is built into modern browsers
```

### 4. Restart Servers
```bash
# Terminal 1: Restart backend
cd server
npm start

# Terminal 2: Restart frontend  
cd client
npm run dev
```

## 🗄️ Data Compatibility

### Existing Tasks
Your existing tasks will continue to work! The app automatically handles tasks created in v1.0:

**v1.0 Task:**
```json
{
  "id": "123",
  "title": "Learn React",
  "progress": 75,
  "category": "learning"
}
```

**v2.0 Compatibility:**
- Tasks without `estimatedTime` → defaults to 25 minutes
- Tasks without `elapsedTime` → defaults to 0 seconds
- Progress percentage is preserved
- Timer starts from 0 when you first start it

### New Tasks
Tasks created in v2.0 include timer fields:
```json
{
  "id": "456",
  "title": "Complete Tutorial",
  "estimatedTime": 30,
  "elapsedTime": 1200,
  "progress": 67,
  "category": "learning"
}
```

## 🎮 Usage Changes

### Creating Quests

**v1.0 Workflow:**
1. Create task
2. Manually update progress percentage
3. Set to 100% to complete

**v2.0 Workflow:**
1. Create task + **set estimated time**
2. **Start timer** when working
3. **Pause** when taking breaks
4. Auto-completes when time is reached!

### Benefits of Timer System
- ⏱️ More accurate time tracking
- 🎯 Better focus with clear time goals
- 📊 Real data on how long tasks take
- 🔔 Audio cues keep you engaged
- ⚡ Auto-completion reduces manual work

## 🔧 Troubleshooting

### Q: My old tasks don't show timers?
**A:** Start the timer for the first time, it will begin tracking from 0.

### Q: Can I still use percentage-based progress?
**A:** The progress bar still shows percentage, but it's now calculated automatically from `elapsedTime / estimatedTime`. For manual control, you can edit `estimatedTime` to adjust when the task completes.

### Q: I don't hear sound effects?
**A:** 
- Check browser permissions (some browsers block autoplay audio)
- Ensure your device volume is on
- Try clicking a button - sounds play on user interaction
- Check browser console for any errors

### Q: Can I change estimated time after creating a task?
**A:** Currently, you'd need to delete and recreate the task. Future versions will add edit functionality!

### Q: What happens to my rewards?
**A:** Rewards are unchanged! The same reward system still works when tasks complete at 100%.

## 🎨 UI Differences

### v1.0 Progress Section
```
PROGRESS
[75] %
[====== Progress Bar ======]
```

### v2.0 Timer Section
```
⏱️ TIMER          Target: 25min
      23:45
    ⚡ ACTIVE
[▶️ START] [🔄 RESET]
[====== Progress Bar ======]
```

## 🚀 Performance Notes

- **Timer Accuracy**: Updates every second (1000ms intervals)
- **Sound Generation**: Uses Web Audio API (no external files)
- **Memory**: Minimal overhead per task timer
- **Battery**: Active timers use ~0.1% CPU

## 📝 Rollback (If Needed)

If you need to revert to v1.0:

```bash
# Restore backups
cp data/tasks.json.backup data/tasks.json
cp data/rewards.json.backup data/rewards.json

# Use git to restore old files (if using version control)
git checkout v1.0 -- client/src/components/TaskPanel.jsx
git checkout v1.0 -- client/src/components/TaskPanel.css
git checkout v1.0 -- server/server.js

# Or re-download v1.0 files
```

## 💡 Tips for v2.0

1. **Use Pomodoro Technique**: Set estimated time to 25 min for focused work
2. **Track Learning**: See how long tutorials actually take
3. **Compare Estimates**: Improve your time estimation skills
4. **Pause Freely**: Taking breaks doesn't affect your progress
5. **Let It Play**: Hear the victory sound when you complete - it's satisfying! 🎉

## 🆘 Need Help?

- Check `README.md` for full documentation
- Review `CHANGELOG.md` for all changes
- Existing features work the same way
- Only the progress tracking method changed

---

**Welcome to QuestFlow v2.0!** Enjoy the new timer system and happy questing! ⚡
