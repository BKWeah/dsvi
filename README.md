# DSVI Platform

## Description
The DSVI Platform is a comprehensive web application designed to manage schools, school content, and administrative tasks. It features distinct interfaces for DSVI administrators and individual school administrators, facilitating efficient content management, user invitations, and school-specific settings. The platform leverages modern web technologies to provide a robust and scalable solution.

## Features
- **User Authentication & Authorization**: Secure login and signup processes with role-based access control for DSVI admins and school admins.
- **DSVI Admin Dashboard**: Centralized management for schools, including adding new schools, managing school requests, and overseeing school content.
- **School Admin Dashboard**: Dedicated interface for school administrators to manage their school's specific content, pages, and settings.
- **Content Management System (CMS)**: Tools for creating, editing, and publishing school pages and content.
- **Responsive UI**: Built with a modern component library (likely Shadcn UI) for a consistent and responsive user experience across devices.
- **Supabase Integration**: Backend services powered by Supabase for database management, authentication, and serverless functions (e.g., `create-school-admin`).
- **Protected Routes**: Ensures that only authorized users can access specific parts of the application.

## Technologies Used
- **Frontend**:
    - React (with TypeScript)
    - Vite (for fast development and bundling)
    - Tailwind CSS (for styling)
    - Shadcn UI (for UI components)
- **Backend/Database**:
    - Supabase (PostgreSQL database, Authentication, Edge Functions)
- **Development Tools**:
    - Bun (package manager)
    - ESLint (for code linting)
    - PostCSS

## Setup Instructions

To get the DSVI Platform up and running on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone [repository-url]
cd dsvi
```

### 2. Install Dependencies
Using Bun:
```bash
bun install
```
Or using npm:
```bash
npm install
```

### 3. Supabase Setup
This project relies on Supabase for its backend.
- **Initialize Supabase**: If you haven't already, initialize Supabase in your project directory:
    ```bash
    supabase init
    ```
- **Link to your Supabase Project**: Link your local setup to your Supabase project:
    ```bash
    supabase link --project-ref your-project-ref
    ```
    (Replace `your-project-ref` with your actual Supabase project reference.)
- **Set up Environment Variables**: Create a `.env.local` file in the root directory and add your Supabase URL and Anon Key:
    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
- **Run Migrations**: Apply the database migrations:
    ```bash
    supabase migration up
    ```
- **Deploy Supabase Functions**: Deploy the necessary Supabase Edge Functions:
    ```bash
    supabase functions deploy create-school-admin
    # Add other functions as needed
    ```

### 4. Run the Development Server
Using Bun:
```bash
bun dev
```
Or using npm:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

### DSVI Admin
- Navigate to `/dsvi-admin` after logging in with an admin account.
- Manage schools, invite school administrators, and oversee content.

### School Admin
- Log in with a school admin account.
- Access your school's dashboard to manage pages, content, and settings specific to your institution.

## Project Structure (Overview)

```
.
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   │   ├── cms/            # CMS-specific components
│   │   ├── dsvi-admin/     # Components for DSVI admin panel
│   │   ├── layouts/        # Application layouts
│   │   ├── public/         # Public-facing components
│   │   └── ui/             # UI components (Shadcn UI)
│   ├── contexts/           # React Contexts (e.g., AuthContext)
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Integrations with external services (e.g., Supabase)
│   ├── lib/                # Utility functions and types
│   └── pages/              # Application pages/routes
│       ├── dsvi-admin/     # Pages for DSVI admin panel
│       └── school-admin/   # Pages for school admin panel
└── supabase/               # Supabase related files
    ├── functions/          # Supabase Edge Functions
    ├── migrations/         # Database migration scripts
    └── config.toml         # Supabase configuration
