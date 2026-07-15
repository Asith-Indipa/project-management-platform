# WorkSync API Documentation

This document outlines the core RESTful API endpoints developed for the WorkSync application. 
All protected routes require a JWT token passed in the `Authorization` header as `Bearer <token>`.

**Base URL (Local):** `http://localhost:5000/api`
**Base URL (Production):** `[Insert Railway Backend URL here]/api`

---

## 🔐 1. Authentication (`/api/auth`)

### Register User
- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (201):** Returns JWT token and basic user info. (Default role assigned is `TEAM_MEMBER`).

### Login User
- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (200):** Returns JWT token and user info.

### Get Current User (Profile)
- **URL:** `/auth/profile`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response (200):** Returns logged-in user profile details and role.

---

## 📁 2. Projects (`/api/projects`)

### Get All Projects
- **URL:** `/projects`
- **Method:** `GET`
- **Auth Required:** Yes (All Roles)
- **Description:** Returns a list of projects. `TEAM_MEMBER`s only see projects they are assigned to. `ADMIN` and `PROJECT_MANAGER` see all.

### Create Project
- **URL:** `/projects`
- **Method:** `POST`
- **Auth Required:** Yes (`ADMIN`, `PROJECT_MANAGER` only)
- **Request Body:**
  ```json
  {
    "name": "New Website Redesign",
    "description": "Redesigning the corporate website.",
    "status": "PLANNING",
    "managerId": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-06-01T00:00:00.000Z"
  }
  ```
- **Response (201):** Returns the created project object.

### Update Project
- **URL:** `/projects/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (`ADMIN`, `PROJECT_MANAGER` only)

### Delete Project
- **URL:** `/projects/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`ADMIN`, `PROJECT_MANAGER` only)

---

## ✅ 3. Tasks (`/api/tasks`)

### Create Task
- **URL:** `/tasks`
- **Method:** `POST`
- **Auth Required:** Yes (`ADMIN`, `PROJECT_MANAGER` only)
- **Request Body:**
  ```json
  {
    "title": "Design Figma Mockups",
    "description": "Create the initial mockups.",
    "status": "TO_DO",
    "priority": "HIGH",
    "projectId": 1,
    "assigneeId": 2,
    "dueDate": "2024-02-01T00:00:00.000Z"
  }
  ```

### Get Tasks for a Project
- **URL:** `/projects/:projectId/tasks`
- **Method:** `GET`
- **Auth Required:** Yes

### Update Task
- **URL:** `/tasks/:id`
- **Method:** `PUT`
- **Auth Required:** Yes 
- **Description:** `TEAM_MEMBER`s can update task status and progress. `PROJECT_MANAGER`s and `ADMIN`s can update all fields including assignment.

---

## 📊 4. Dashboard & Analytics (`/api/dashboard`)

### Get General Dashboard Stats
- **URL:** `/dashboard/admin`
- **Method:** `GET`
- **Auth Required:** Yes
- **Description:** Returns aggregated stats tailored to the logged-in user's role (e.g., specific active tasks for a team member, system-wide stats for an admin).

### Get Full System Analytics
- **URL:** `/dashboard/analytics`
- **Method:** `GET`
- **Auth Required:** Yes (`ADMIN`, `PROJECT_MANAGER` only)
- **Description:** Returns deep analytics (Total Users, Total Projects, Completion Rates).

---

## 👥 5. User Management (`/api/admin`)

### Get All Users
- **URL:** `/admin/users`
- **Method:** `GET`
- **Auth Required:** Yes (`ADMIN` only)

### Update User Role
- **URL:** `/admin/users/:id/role`
- **Method:** `PATCH`
- **Auth Required:** Yes (`ADMIN` only)
- **Request Body:**
  ```json
  {
    "role": "PROJECT_MANAGER"
  }
  ```
