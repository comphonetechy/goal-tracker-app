# 🛠️ Development Guide

## Getting Started with Development

### Prerequisites
- Node.js v16+
- Code editor (VS Code recommended)
- Basic knowledge of React and Express

### Development Workflow

1. **Start Backend in Watch Mode**
```bash
cd server
npm run dev  # Uses --watch flag for auto-restart
```

2. **Start Frontend with Hot Reload**
```bash
cd client
npm run dev  # Vite hot module replacement
```

3. **Make Changes**
- Frontend: Changes auto-reload in browser
- Backend: Server auto-restarts on file changes

## 🏗️ Architecture Overview

### Frontend Architecture
```
React App (Vite)
├── App.jsx (Main container, state management)
├── Components
│   ├── Calendar.jsx (Date selection & visualization)
│   ├── TaskPanel.jsx (CRUD operations for tasks)
│   └── Stats.jsx (Achievements & metrics display)
└── CSS Modules (Component-specific styling)
```

### Backend Architecture
```
Express Server
├── REST API Routes
│   ├── /api/tasks (CRUD endpoints)
│   └── /api/rewards (Read endpoint)
├── JSON File Storage
│   ├── tasks.json
│   └── rewards.json
└── Reward Generation Logic
```

## 📊 State Management

### Current Approach
- **React useState**: Local component state
- **Prop drilling**: Parent-to-child data flow
- **API calls**: Direct fetch in App.jsx

### Future Scalability Options
- **Context API**: Global state without prop drilling
- **Redux/Zustand**: More complex state management
- **React Query**: Server state caching & sync

## 🎨 Styling System

### CSS Architecture
```css
/* Global theme variables */
:root {
  --bg-primary: #0a0e1a;
  --accent-cyan: #00f0ff;
  /* ... */
}

/* Component-specific styles */
.component-name { /* ... */ }

/* Responsive breakpoints */
@media (max-width: 768px) { /* ... */ }
```

### Design Tokens
- Colors: Defined as CSS variables for easy theming
- Fonts: Google Fonts (Orbitron, Rajdhani)
- Spacing: Consistent rem-based scale
- Animations: Framer Motion for complex, CSS for simple

## 🔌 API Design

### RESTful Principles
- `GET`: Retrieve resources
- `POST`: Create new resources
- `PUT`: Update existing resources
- `DELETE`: Remove resources

### Request/Response Format
```javascript
// POST /api/tasks
{
  "title": "string",
  "description": "string",
  "date": "YYYY-MM-DD",
  "category": "string"
}

// Response
{
  "id": "timestamp-string",
  "title": "string",
  "progress": 0,
  "completed": false,
  "createdAt": "ISO-8601"
}
```

## 🎮 Adding New Features

### Example: Adding a New Category

1. **Update TaskPanel.jsx**
```javascript
const categories = [
  'general', 'learning', 'fitness', 
  'creative', 'work', 'personal',
  'health' // New category
];

const categoryColors = {
  // ... existing colors
  health: '#4caf50'
};
```

2. **No backend changes needed** - Categories are frontend-only

### Example: Adding a New Badge

1. **Update server/server.js**
```javascript
badges: [
  // ... existing badges
  { 
    id: 'super-user', 
    name: 'Super User', 
    icon: '⭐', 
    description: 'Complete 100 tasks' 
  }
]
```

2. **Implement unlock logic** (optional)
```javascript
// In reward generation or task completion logic
if (completedTasksCount >= 100) {
  // Award super-user badge
}
```

## 🚀 Performance Optimization Tips

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for large task lists
- Lazy load components with React.lazy
- Optimize images and assets

### Backend
- Add request rate limiting
- Implement response caching
- Use compression middleware
- Add database indexes (when migrating from JSON)

## 🧪 Testing Recommendations

### Unit Tests
```bash
npm install --save-dev vitest @testing-library/react
```

### Example Test
```javascript
import { render, screen } from '@testing-library/react';
import Calendar from './Calendar';

test('renders calendar with current month', () => {
  render(<Calendar selectedDate="2026-02-03" />);
  expect(screen.getByText(/FEBRUARY/i)).toBeInTheDocument();
});
```

### API Tests
```bash
npm install --save-dev supertest
```

## 🔒 Security Considerations

### Current State (Development)
- No authentication
- Open CORS policy
- Local JSON storage

### Production Recommendations
- Add user authentication (JWT, OAuth)
- Restrict CORS to specific origins
- Migrate to proper database (MongoDB, PostgreSQL)
- Add input validation & sanitization
- Implement rate limiting
- Use HTTPS

## 📦 Deployment Options

### Option 1: Separate Deployments
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, Render
- **Database**: MongoDB Atlas, Supabase

### Option 2: Full-Stack Platforms
- Render (full-stack)
- Railway
- Fly.io

### Environment Variables
```bash
# Backend .env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com

# Frontend .env
VITE_API_URL=https://your-backend.com/api
```

## 🐛 Debugging Tips

### Frontend
1. Use React DevTools browser extension
2. Check browser console for errors
3. Inspect network tab for API calls
4. Add console.log in useEffect hooks

### Backend
1. Check terminal for error logs
2. Use Postman/Insomnia for API testing
3. Add debug logging: `console.log('Debug:', variable)`
4. Verify JSON files in data/ directory

## 📚 Learning Resources

### React
- [Official React Docs](https://react.dev)
- [Framer Motion Docs](https://www.framer.com/motion/)

### Node/Express
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Design
- [CSS-Tricks](https://css-tricks.com)
- [Web Animation](https://web.dev/animations/)

## 🎯 Roadmap Ideas

### Short-term (Easy)
- [ ] Add task editing (not just progress)
- [ ] Implement task search/filter
- [ ] Add dark/light theme toggle
- [ ] Export tasks to CSV

### Medium-term (Moderate)
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Weekly/monthly views
- [ ] Data visualization charts

### Long-term (Advanced)
- [ ] AI task suggestions
- [ ] Multi-user support
- [ ] Mobile app (React Native)
- [ ] Integration with Google Calendar
- [ ] Social features (share achievements)

## 💡 Pro Tips

1. **Keep components small**: < 200 lines ideal
2. **Use semantic HTML**: Better accessibility
3. **Comment complex logic**: Future you will thank you
4. **Commit often**: Small, focused commits
5. **Test in multiple browsers**: Chrome, Firefox, Safari
6. **Mobile-first design**: Start responsive from the beginning

---

Happy coding! 🚀 Need help? Check the README or create an issue.
