# Quotes — Daily Inspiration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Ready-blueviolet)](.)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.io)

A modern, installable **Progressive Web App (PWA)** for discovering, searching, and sharing curated quotes. Built with vanilla HTML, CSS, and JavaScript — no frameworks required. Features a beautiful glassmorphism UI, dark/light mode, offline caching, and a full admin dashboard backed by Supabase.

![Quotes App Preview](https://via.placeholder.com/1200x630/0a0a0f/8b5cf6?text=Quotes+App+Preview)

---

## ✨ Features

### User Experience
- **🔮 Glassmorphism Design** — Frosted glass cards with animated gradient backgrounds
- **🌗 Dark / Light Mode** — Seamless theme switching with persistence
- **📱 Fully Responsive** — Optimized for mobile, tablet, and desktop
- **🔍 Search & Filter** — Real-time quote search and category filtering
- **🔗 Share & Copy** — Native Web Share API + clipboard copy with toast notifications
- **⭐ Featured Quote** — Prominently displayed pinned quote section

### Progressive Web App
- **📲 Install Prompt** — Add to home screen on any device
- **⚡ Offline Support** — Service Worker caches the app shell and API responses
- **🔄 Background Sync** — Fresh data loads automatically when back online
- **🎨 Themed Status Bar** — Immersive mobile experience

### Admin Dashboard
- **🔐 Secure Login** — Supabase Authentication
- **📊 Stats Overview** — Animated counters for quotes, featured, and categories
- **➕ Add / Edit Quotes** — Full CRUD with modal forms
- **📌 Pin Featured** — Toggle featured status with one click
- **🗑️ Delete** — Confirmation modal before permanent removal

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **PWA** | Web App Manifest, Service Worker (Cache-first strategy) |
| **Styling** | CSS Custom Properties, Glassmorphism, CSS Grid & Flexbox |
| **Icons** | Font Awesome 6 |
| **Fonts** | Inter, Playfair Display (Google Fonts) |

---

## 📁 Project Structure

```

quotes-app/
├── index.html              # Home page (quotes grid)
├── login.html              # Admin login
├── admin.html              # Admin dashboard
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline caching)
├── setup-admin.html        # One-time admin account creation
├── css/
│   ├── style.css           # Global styles, glassmorphism, animations
│   └── admin.css           # Dashboard-specific styles
├── js/
│   ├── config.js           # Supabase credentials
│   ├── supabase.js         # Supabase client & auth helpers
│   ├── app.js              # Home page logic
│   ├── login.js            # Login form handling
│   └── admin.js            # Dashboard CRUD operations
└── icons/
├── icon-192x192.png
└── icon-512x512.png

```

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/quotes-app.git
cd quotes-app
```

2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your Project URL and Anon Key
3. Paste them into `js/config.js`:

```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

3. Set Up the Database

Open the SQL Editor in your Supabase dashboard and run:

```sql
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON public.quotes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated insert"
ON public.quotes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
ON public.quotes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
ON public.quotes FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_quotes_featured ON public.quotes(featured);
CREATE INDEX idx_quotes_category ON public.quotes(category);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at DESC);
```

4. Create an Admin Account

Option A — Dashboard:
- Go to Authentication → Users in Supabase
- Click Add user and set email + password

Option B — Setup Page:
- Open `setup-admin.html` in your browser
- Fill in the form and create your account
- Delete `setup-admin.html` after use

5. Add PWA Icons

Replace the placeholder icons in the `icons/` folder with your own:
- `icon-192x192.png`
- `icon-512x512.png`

> 💡 Tip: Use [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) to generate all required sizes automatically.

6. Deploy

Host the files on any static hosting service:

Platform	Guide	
Vercel	`vercel --prod`	
Netlify	Drag & drop folder to deploy	
GitHub Pages	Enable in repo settings	
Supabase Storage	Upload to a storage bucket	

---

📲 Installing as an App

Android (Chrome)
1. Open the deployed URL in Chrome
2. Tap the ⋮ menu → Add to Home screen
3. Confirm the installation

iOS (Safari)
1. Open the deployed URL in Safari
2. Tap Share → Add to Home Screen
3. Confirm the installation

Desktop (Chrome/Edge)
1. Open the deployed URL
2. Click the ⊕ Install icon in the address bar
3. Confirm the installation

Once installed, the app works offline and launches as a standalone application without browser chrome.

---

🔄 Offline Behavior

Scenario	Behavior	
First visit	App shell + quotes are cached	
Offline browsing	Cached quotes are displayed	
Back online	Fresh data loads automatically from Supabase	
Admin actions offline	Will fail gracefully with toast notification	

---

🎨 Customization

Change Theme Colors
Edit CSS custom properties in `css/style.css`:

```css
:root {
  --color-primary: #8b5cf6;      /* Purple accent */
  --color-accent: #06b6d4;       /* Cyan accent */
  --color-bg: #0a0a0f;           /* Dark background */
}
```

Add More Sample Quotes
Run additional `INSERT` statements in the Supabase SQL Editor.

---

🔒 Security Notes

- Never commit `js/config.js` with real credentials to public repos
- Use Supabase Row Level Security (RLS) to protect your data
- Delete `setup-admin.html` after creating your admin account
- Consider enabling Email Confirmation in Supabase Auth settings for production

---

🐛 Troubleshooting

Issue	Solution	
"Failed to initialize Supabase"	Check that `config.js` has valid URL and key	
Quotes not loading	Verify RLS policies allow `SELECT` for `anon`	
Can't log in	Ensure user exists in Supabase Auth → Users	
PWA not installable	Confirm `manifest.json` and `sw.js` are served with correct MIME types	
Icons not showing	Replace placeholder icons in `icons/` folder	

---

📄 License

This project is licensed under the MIT License — feel free to use, modify, and distribute.

---

🙏 Acknowledgments

- [Supabase](https://supabase.com) for the open-source Firebase alternative
- [Font Awesome](https://fontawesome.com) for the beautiful icons
- [Google Fonts](https://fonts.google.com) for Inter and Playfair Display

---
