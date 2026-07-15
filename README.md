# WorkSync - Project and Team Task Management Platform

## Overview

WorkSync is a comprehensive Project and Team Task Management Platform.It allows organizations to manage users, projects, and tasks efficiently with secure role-based access control.

## 🚀 Live Demo & Links

- **Live Website:** [WorkSync Live App](https://project-management-platform-pearl.vercel.app/dashboard)
- **Video Walkthrough and Images:** [Google Drive Folder](https://drive.google.com/drive/folders/1JF7sWvkrHQOISTQw19V8aDtWHCiG61pJ?usp=sharing)
- **API Documentation:** [API Docs](docs/API_DOCS.md)
- **Postman Collection:** [Postman JSON](docs/WorkSync_Postman_Collection.json)
- **System Diagrams:** [Diagrams](docs/DIAGRAMS.md)
- **Feature Report:** [Feature Report](docs/FEATURE_REPORT.md)

## 🔐 Test Credentials (Live Demo)

To fully explore the role-based features of the application, please use the following test accounts:

**1. Admin Account** (Full access to all features & user management)

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

**2. Project Manager Account** (Can create projects and assign tasks)

- **Email:** `manager@gmail.com`
- **Password:** `manager123`

**3. Team Member Account** (Can only view assigned tasks and update progress)

- **Email:** `member@gmail.com`
- **Password:** `member123`

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL, Prisma ORM
- **Deployment:** Vercel (Frontend), Railway (Backend & Database)
- **CI/CD:** GitHub Actions

## ✨ Core Features

- **Administrator:** Manage users, roles, projects, and overall system access.
- **Project Manager:** Create and manage projects, assign team members, and manage project-related tasks.
- **Team Member:** View assigned projects and tasks, update task progress, and perform permitted task-related activities.

## ⚙️ Setup and Run Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- MySQL Database

### 2. Clone the Repository

```bash
git clone https://github.com/Asith-Indipa/project-management-platform.git
cd project-management-platform
```

### 3. Backend Setup

```bash
cd backend
npm install
```

- Create a `.env` file in the `backend` directory based on `.env.example`:
  ```env
  DATABASE_URL="mysql://username:password@localhost:3306/task_management_db"
  JWT_SECRET="your_secret_key"
  PORT=5000
  ```
- Run Prisma migrations and generate the client:
  ```bash
  npx prisma db push
  npx prisma generate
  ```
- Start the backend development server:
  ```bash
  npm run dev
  ```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

- Create a `.env.local` file in the `frontend` directory based on `.env.example`:
  ```env
  NEXT_PUBLIC_API_URL="http://localhost:5000/api"
  ```
- Start the frontend development server:
  ```bash
  npm run dev
  ```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 AI Tools Used

During the development of this project, AI assistants (such as ChatGPT / Gemini) were utilized to enhance productivity and code quality in the following areas:

- **UI/UX Design Assistance:** Generating complex Tailwind CSS utility classes for responsive layouts and modern UI components.
- **Boilerplate & Logic:** Assisting with repetitive code structure for Express routes, controllers, and Prisma schemas.
- **Debugging & Refactoring:** Identifying and resolving TypeScript type errors and database connection issues.
- **Documentation & Workflows:** Drafting the GitHub Actions CI/CD pipeline configuration (`.github/workflows/ci.yml`) and structuring this README file.

## 🔄 CI/CD Workflow Explanation

This project utilizes **GitHub Actions** for Continuous Integration (CI).

- The workflow (`.github/workflows/ci.yml`) is triggered automatically on every push or pull request to the `main` branch.
- It sets up a Node.js environment, installs dependencies, and runs `npm run build` to validate that both the frontend and backend compile successfully without any syntax or linting errors.
- Continuous Deployment (CD) is handled automatically via Vercel (Frontend) and Railway (Backend), which listen to the `main` branch and deploy successful builds instantly.

## 📊 Database & Architecture

_Refer to the `docs/` folder for the Entity Relationship Diagram (ERD), Use Case Diagram, and System Architecture Diagram._
