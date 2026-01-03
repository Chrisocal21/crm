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

- **Modern Landing Page** - Beautiful, responsive design
- **Zero Dependencies** - No backend required
- **Fast Loading** - Built with Vite for optimal performance
- **Mobile Friendly** - Fully responsive design
- **Easy Customization** - Simple React components

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

After deploying the landing page, you can:

1. ✅ Test the live site
2. ✅ Configure custom domain (optional)
3. ✅ Start building the full CRM (see build.md)
4. ✅ Add the CRM app to this project

## 🚧 Coming Soon

The full CRM application with:
- Kanban board for order management
- Client management system
- Analytics dashboard
- Invoice generation
- localStorage persistence

## 📄 License

This is a custom project. Feel free to modify and use for your business.

## 🤝 Support

For questions or issues, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

Built with ❤️ for artisan businesses
