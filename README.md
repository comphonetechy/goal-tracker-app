# 🚀 QuestFlow - Gamified Goal Tracker

**Level up your life, one quest at a time!**

QuestFlow is a futuristic, gamified goal-tracking web application that transforms your daily tasks into epic quests. Complete tasks, earn rewards, unlock badges, and watch your productivity soar with a visually stunning cyber-themed interface.

![QuestFlow](https://img.shields.io/badge/Status-Ready_to_Launch-00f0ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=for-the-badge&logo=express)

## ✨ Features

### 🎯 Core Functionality
- **Interactive Calendar View**: Navigate through months with a sleek, futuristic calendar interface
- **Daily Task Management**: Create, edit, and track tasks for specific dates
- **⏱️ Smart Timer System**: 
  - Set estimated time for each task (in minutes)
  - Pausable/resumable stopwatch timer
  - Real-time elapsed time tracking with live display
  - Auto-completion when timer reaches target duration
  - Visual pulsing indicator when timer is active
- **Task Categories**: Organize tasks by type (Learning, Fitness, Creative, Work, Personal, General)

### 🎮 Gamification & Sound System
- **🔊 Audio Feedback** (Web Audio API):
  - **Start Sound**: Pleasant beep (440 Hz) when timer begins
  - **Pause Sound**: Soft tone (330 Hz) when pausing
  - **Completion Sound**: Victory chime - three ascending notes for quest completion
  - **Tick Sound**: Subtle notification every minute of work
- **Random Reward Generator**: Earn surprise rewards when completing tasks
  - **Power Points**: Accumulate points for every completed quest
  - **Badges**: Unlock achievements for specific milestones
  - **Unlockables**: Earn themes, avatars, and titles
  - **Motivational Messages**: Get hyped with random encouraging messages

### 📊 Statistics Dashboard
- Real-time tracking of:
  - Total Power Points earned
  - Quests completed
  - Success rate percentage
  - Badges showcase
  - Unlocked rewards gallery

### 🎨 Design Highlights
- **Cyber-Futuristic Theme**: Neon cyan and magenta color scheme with glowing effects
- **Custom Fonts**: Orbitron for headers, Rajdhani for body text
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive Design**: Fully mobile-friendly interface
- **Visual Feedback**: Glowing borders, animated progress bars, and particle effects

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0**: Modern component-based UI
- **Vite**: Lightning-fast build tool and dev server
- **Framer Motion**: Smooth, performant animations
- **CSS Variables**: Dynamic theming system

### Backend
- **Express 4.18.2**: RESTful API server
- **Node.js**: JavaScript runtime
- **JSON File Storage**: Simple, portable data persistence
- **CORS**: Cross-origin resource sharing enabled

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone or download the project**
```bash
cd goal-tracker-app
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

4. **Start the Backend Server**
```bash
cd ../server
npm start
```
The server will run on `http://localhost:3001`

5. **Start the Frontend (in a new terminal)**
```bash
cd client
npm run dev
```
The app will open on `http://localhost:3000`

6. **Open your browser**
Navigate to `http://localhost:3000` and start tracking your goals!

## 🎮 How to Use

### Creating Your First Quest
1. Click on a date in the calendar
2. Click the **"+ NEW QUEST"** button
3. Enter a quest title (required)
4. Add a description (optional)
5. **Set estimated time** in minutes (default: 25 min - Pomodoro style!)
6. Select a category
7. Click **"🚀 START QUEST"**

### Using the Timer
1. Click on a day with tasks
2. Find your quest in the task panel
3. Click **"▶️ START"** to begin the timer
4. Timer counts up and displays elapsed time (MM:SS or H:MM:SS)
5. Click **"⏸️ PAUSE"** to pause your work session
6. Click **"🔄 RESET"** to restart from zero
7. Progress bar automatically fills based on elapsed time vs estimated time
8. Quest auto-completes when timer reaches the estimated duration!

### Sound Effects
- **Start**: Pleasant beep confirms timer started
- **Pause**: Soft tone when you take a break
- **Every Minute**: Subtle tick to mark progress
- **Completion**: Victory chime with three ascending notes! 🎉

### Completing Quests
1. Let the timer reach **100%** of estimated time (or manually complete)
2. Receive an instant random reward!
3. See your stats update in real-time
4. Bask in the glory of completion animations

### Reward Types
- **Points** (10-60 points): Standard quest completion rewards
- **Badges**: Special achievements for milestones
  - First Victory 🥇
  - 3-Day Streak 🔥
  - Perfectionist 💎
  - Early Bird 🌅
  - Night Owl 🦉
  - Speed Demon ⚡
  - Marathon Runner 🏃
  - Centurion 💯
- **Unlockables**: Themes, avatars, and titles
- **Motivational Messages**: Instant dopamine boost!

## 📁 Project Structure

```
goal-tracker-app/
├── server/                 # Backend Express server
│   ├── server.js          # Main server file with API routes
│   └── package.json       # Backend dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.jsx      # Interactive calendar component
│   │   │   ├── Calendar.css      # Calendar styling
│   │   │   ├── TaskPanel.jsx     # Task management panel
│   │   │   ├── TaskPanel.css     # Task panel styling
│   │   │   ├── Stats.jsx         # Statistics dashboard
│   │   │   └── Stats.css         # Stats styling
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # App layout styling
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles & theme
│   ├── index.html         # HTML entry point
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
└── data/                  # JSON data storage (auto-generated)
    ├── tasks.json         # Tasks database
    └── rewards.json       # Rewards & achievements
```

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:date` - Get tasks for specific date
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task (including progress)
- `DELETE /api/tasks/:id` - Delete task

### Rewards
- `GET /api/rewards` - Get rewards data and statistics

## 🎨 Customization

### Changing the Color Scheme
Edit CSS variables in `client/src/index.css`:
```css
:root {
  --bg-primary: #0a0e1a;      /* Main background */
  --accent-cyan: #00f0ff;      /* Primary accent */
  --accent-magenta: #ff00e5;   /* Secondary accent */
  --accent-yellow: #ffeb3b;    /* Highlight color */
  --accent-green: #00ff88;     /* Success color */
}
```

### Adding New Categories
Modify the categories array in `client/src/components/TaskPanel.jsx`:
```javascript
const categories = ['general', 'learning', 'fitness', 'creative', 'work', 'personal'];
const categoryColors = {
  general: 'var(--accent-cyan)',
  learning: '#9c27b0',
  // Add your custom category here
};
```

### Creating New Badges
Edit the rewards pool in `server/server.js`:
```javascript
badges: [
  { 
    id: 'custom-badge', 
    name: 'Custom Achievement', 
    icon: '🎖️', 
    description: 'Your custom achievement' 
  },
  // Add more badges
]
```

## 🚀 Future Enhancements (AI-Ready Architecture)

The codebase is structured to easily support:
- **AI Task Suggestions**: Analyze patterns and suggest optimal tasks
- **Smart Scheduling**: AI-powered task distribution across days
- **Progress Predictions**: Machine learning to forecast completion times
- **Motivational AI Coach**: Context-aware encouragement system
- **Habit Analysis**: Identify trends and productivity patterns
- **Voice Commands**: Natural language task creation
- **Collaborative Goals**: Multi-user support with shared quests

## 📝 Data Storage

All data is stored in JSON files in the `data/` directory:
- **tasks.json**: Contains all tasks with metadata
- **rewards.json**: Stores points, badges, and unlockables

### Task Data Model
```json
{
  "id": "unique-id",
  "title": "Learn React",
  "description": "Complete React tutorial",
  "date": "2026-02-03",
  "progress": 75,
  "category": "learning",
  "createdAt": "2026-02-03T10:30:00Z",
  "completed": false,
  "reward": null
}
```

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 3001 is occupied:
```bash
# Change server port in server/server.js
const PORT = 3002; // or any available port

# Change client port in client/vite.config.js
server: { port: 3005 }
```

### CORS Errors
Ensure the server is running and CORS is properly configured in `server.js`

### Data Not Persisting
Check that the `data/` directory has write permissions

## 🤝 Contributing

This is a personal project template, but feel free to:
- Fork and customize for your needs
- Report bugs or suggest features
- Share your customized versions!

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🎉 Acknowledgments

- Design inspired by cyberpunk and futuristic gaming aesthetics
- Icons: Emoji (universally supported)
- Fonts: Google Fonts (Orbitron & Rajdhani)

---

**Built with ⚡ by a fellow productivity enthusiast**

*Now go forth and conquer your quests, champion!* 🚀
