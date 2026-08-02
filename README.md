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

quotes-app/
├── index.html 
### Home page (quotes grid) 
├── login.html
### Admin login 
├── admin.html 
### Admin dashboard
├── manifest.json 
### PWA manifest
├── sw.js 
### Service Worker (offline caching)
├── setup-admin.html 
### One-time admin account creation 
├── css/ 
│ ├── style.css
### Global styles, glassmorphism, animations
│ └── admin.css 
### Dashboard-specific styles 
├── js/
│ ├── config.js
### Supabase credentials
│ ├── supabase.js 
### Supabase client & auth helpers
│ ├── app.js 
### Home page logic
│ ├── login.js 
### Login form handling
│ └── admin.js
### Dashboard CRUD operations
└── icons/  
├── icon-192x192.png  
└── icon-512x512.png
