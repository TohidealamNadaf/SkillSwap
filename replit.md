# Expense Management System

## Overview

This is a full-stack expense management application built with modern web technologies. The system allows employees to submit expense reports, managers to approve/reject them, and administrators to manage the overall system. It features a React frontend with TypeScript, Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Comprehensive set of accessible components from shadcn/ui

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: Session-based authentication (simple username/password)
- **API Design**: RESTful API endpoints with consistent error handling

### Project Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express.js application
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Key Components

### Database Schema (shared/schema.ts)
- **Users**: Employee information with role-based access (agent, manager, admin)
- **Expenses**: Expense records with categories, amounts, and approval status
- **Approvals**: Approval workflow tracking
- **Teams**: Team structure for organizational hierarchy
- **Team Members**: Many-to-many relationship between users and teams

### Authentication System
- Simple username/password authentication
- Role-based access control (agent, manager, admin)
- Client-side auth state management with localStorage persistence
- Protected routes based on authentication status

### Expense Management
- Multi-category expense tracking (travel, meals, marketing, etc.)
- File upload support for receipts
- Status workflow: pending → submitted → approved/rejected
- Approval workflow for managers

### UI Components
- Responsive design with mobile support
- Dark/light theme support
- Comprehensive form validation
- Data visualization with charts (Recharts)
- Toast notifications for user feedback

## Data Flow

1. **User Registration/Login**: Users authenticate through the login page
2. **Expense Creation**: Employees create expenses with details and optional receipts
3. **Submission Workflow**: Expenses move from draft to submitted status
4. **Approval Process**: Managers review and approve/reject submitted expenses
5. **Reporting**: Dashboard and reports provide insights into spending patterns

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM
- **Styling**: Tailwind CSS, Radix UI primitives
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form, Hookform Resolvers
- **Validation**: Zod
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Routing**: Wouter

### Backend Dependencies
- **Server**: Express.js
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Validation**: Zod with drizzle-zod integration
- **Session Management**: connect-pg-simple
- **Development**: tsx for TypeScript execution

### Development Tools
- **Build**: Vite, esbuild
- **TypeScript**: Full type safety across frontend and backend
- **Database**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with hot reload
- **Database**: Local PostgreSQL or Neon serverless

### Production
- **Build Process**: 
  - Frontend: Vite build to static assets
  - Backend: esbuild bundle for Node.js deployment
- **Deployment Target**: Replit autoscale with PostgreSQL module
- **Port Configuration**: Backend serves on port 5000, external port 80
- **Static Assets**: Express serves built frontend assets

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Production/development environment detection
- Replit-specific optimizations and error handling

## Changelog

```
Changelog:
- June 18, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```