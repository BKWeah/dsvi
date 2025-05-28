# DSVI Platform

A comprehensive multi-school website platform with CMS capabilities built with React, TypeScript, and Supabase.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and keys

# Run development server
bun dev
```

## 📚 Documentation

For comprehensive documentation, features, setup instructions, and architecture details, see:

**[📖 COMPREHENSIVE_DOCUMENTATION.md](./COMPREHENSIVE_DOCUMENTATION.md)**

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/UI + Tailwind CSS  
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router DOM

## ✨ Key Features

- 🏫 Multi-school management platform
- 👨‍💼 Role-based access control (DSVI Admin / School Admin)
- 📝 Dynamic CMS with section-based content editing
- 🎨 Comprehensive theme system with live preview
- 📱 Fully responsive design
- 🔐 Secure authentication with RLS policies
- 📊 School request management
- 🖼️ Media management with Supabase Storage

## 🗂 Project Structure

```
├── src/
│   ├── components/     # UI components and layouts
│   ├── pages/          # Route components (admin & public)
│   ├── contexts/       # React contexts (auth, theme)
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and types
├── supabase/
│   ├── migrations/     # Database migrations
│   └── functions/      # Edge functions
└── public/             # Static assets
```

## 🌐 URLs

- **DSVI Admin**: `/dsvi-admin`
- **School Websites**: `/schools/:schoolSlug` 
- **School Admin CMS**: Access via school admin login

## 🔧 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Available Scripts

```bash
bun dev          # Start development server
bun build        # Build for production  
bun build:dev    # Build for development
bun preview      # Preview production build
bun lint         # Run ESLint
```

## 🚀 Deployment

The app builds to static files and can be deployed to:
- Cloudflare Pages
- Netlify  
- Vercel
- Any static hosting platform

## 📞 Support

For detailed setup instructions, troubleshooting, and feature documentation, please refer to the [Comprehensive Documentation](./COMPREHENSIVE_DOCUMENTATION.md).
