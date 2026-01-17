# Screenshots Directory

## How to Capture Screenshots

To showcase the CRM in the landing page, capture screenshots of:

1. **Dashboard View** - Overview with revenue cards and recent activity
2. **Kanban Board** - Full workflow with drag-and-drop cards
3. **Client Management** - Client cards with details and actions
4. **Analytics** - Charts and growth metrics
5. **Orders View** - Order list with status indicators
6. **Client Portal** - Login and client dashboard
7. **Quotes View** - Quote generator with PDF preview
8. **Calendar** - Timeline view with events

## Screenshot Guidelines

- **Resolution**: 1920x1080 or higher
- **Format**: PNG for best quality
- **Naming**: `dashboard.png`, `kanban.png`, `clients.png`, etc.
- **Clean data**: Use sample data that looks professional
- **Dark mode**: Make sure the dark theme looks good

## Adding Screenshots to Landing Page

Once captured, update `src/components/LandingPage.jsx` to replace the placeholder previews with actual screenshot images:

```jsx
<img 
  src="/screenshots/dashboard.png" 
  alt="Dashboard" 
  className="w-full h-auto rounded-lg"
/>
```

## Quick Capture Tips

1. Navigate to each view in the CRM
2. Press F12 to open DevTools
3. Click "Toggle device toolbar" (Ctrl+Shift+M)
4. Select "Responsive" and set to 1920x1080
5. Take screenshot (Ctrl+Shift+S in Firefox, or use Windows Snipping Tool)
6. Save to this directory
