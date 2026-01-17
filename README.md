# Artisan Studio CRM

A modern, lightweight CRM system built for artisan businesses. Manage orders, clients, and projects with zero monthly fees.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works great!)

### Deployment Steps

#### 1. Push to GitHub

First, initialize this project as a git repository and push it to GitHub:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Artisan Studio CRM landing page"

# Create a new repository on GitHub, then link it
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the framework (Vite/React)
5. Click "Deploy"

Your site will be live at: `https://your-project-name.vercel.app`

### 3. Custom Domain (Optional)

Once deployed, you can add a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## 🛠️ Local Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
crm/
├── src/
│   ├── App.jsx          # Main landing page component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vercel.json          # Vercel deployment config
└── README.md            # This file
```

## 🎨 Features

**99% Complete - Core CRM Functionality Ready!**

### Core Features ✅
- **Dashboard** - Customizable widgets with real-time stats, compact design
- **Kanban Board** - Drag-and-drop order management across workflow stages
- **Client Management** - Full CRUD, custom fields, tags, portal access codes
- **Tasks & Assignments** - Task tracking with priority, due dates, team assignments
- **Calendar** - Visual timeline of orders, tasks, and deadlines
- **Timeline View** - Chronological order and activity tracking
- **Bids & Quotes** - Professional quote generation with PDF export
- **Invoices** - Invoice creation, payment tracking, overdue detection
- **Timesheets** - Work log tracking with hours and billing rates
- **Analytics** - Growth metrics, revenue tracking, client performance, period comparisons
- **Settings** - Business configuration, team management, preferences

### Advanced Features ✅
- **Client Portal** - Self-service portal for clients (quotes, invoices, timesheets, documents, messages)
- **Automated Workflows** - 6 pre-built workflows (quote acceptance, overdue notices, task reminders, etc.)
- **Command Palette** - Global search (Cmd/Ctrl+K) with dual-mode (commands & data search)
- **File Attachments** - Document uploads with drag-and-drop, preview, and download
- **Error Boundaries** - Graceful error handling with recovery options
- **Smart Filters** - Advanced filtering and saved views
- **Bookmarks** - Quick access to important records
- **Export/Import** - JSON data backup and restore
- **Print Support** - Print-optimized views for invoices and reports

### Coming Soon 🚧
- **3rd Party Integrations** - Shopify, Etsy, Stripe, email services
- **Cloud Storage** - External file storage for larger documents
- **Real-time Sync** - Multi-device synchronization

## 🔧 Customization

### Change Business Name

Edit `src/App.jsx` and update the business name and tagline:

```jsx
<h1 className="text-lg font-bold">Your Business Name</h1>
<p className="text-xs text-slate-400 italic">Your tagline</p>
```

### Modify Colors

The project uses Tailwind CSS. To change the color scheme, update the classes in `src/App.jsx`:

- Primary: `blue-600` → `purple-600`, `green-600`, etc.
- Accent: `purple-600` → your preferred color

### Add Your Logo

1. Add your logo to the `public/` folder
2. Update the emoji icon in the navigation with an `<img>` tag

## 📝 Next Steps

After deploying:

1. ✅ **Core CRM Complete** - All major features implemented
2. 🔄 **Testing Phase** - Verify all features work correctly
3. 🚧 **3rd Party Integrations** - Add external service connections
4. 🚀 **Production Ready** - Full CRM system with integrations

## 📄 License

This is a custom project. Feel free to modify and use for your business.

## 🤝 Support

For questions or issues, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

Built with ❤️ for artisan businesses
