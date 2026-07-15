# WorkSync System Diagrams

These diagrams are written in **Mermaid.js** format and will render automatically when viewed on GitHub.

---

## 1. Entity Relationship Diagram (ERD)

This diagram illustrates the core database structure and relationships between Users, Projects, and Tasks.

```mermaid
erDiagram
    USER ||--o{ PROJECT : "manages"
    USER ||--o{ PROJECT_MEMBER : "is member of"
    PROJECT ||--o{ PROJECT_MEMBER : "has members"
    USER ||--o{ TASK : "is assigned to"
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ ACTIVITY : "performs"
    PROJECT ||--o{ ACTIVITY : "logs"
    USER ||--o{ NOTIFICATION : "receives"

    USER {
        int id PK
        string email
        string password
        string name
        string role "ADMIN | PROJECT_MANAGER | TEAM_MEMBER"
        datetime createdAt
    }

    PROJECT {
        int id PK
        string name
        string description
        string status "PLANNING | ACTIVE | ON_HOLD | COMPLETED"
        int managerId FK
        datetime startDate
        datetime endDate
        datetime createdAt
    }

    PROJECT_MEMBER {
        int id PK
        int projectId FK
        int userId FK
        datetime createdAt
    }

    TASK {
        int id PK
        string title
        string description
        string status "TODO | IN_PROGRESS | DONE"
        string priority "LOW | MEDIUM | HIGH"
        int progress
        int projectId FK
        int assignedToId FK
        datetime dueDate
        datetime createdAt
    }

    ACTIVITY {
        int id PK
        string action
        string details
        int userId FK
        int projectId FK
        datetime createdAt
    }

    NOTIFICATION {
        int id PK
        string title
        string message
        boolean isRead
        int userId FK
        datetime createdAt
    }
```

---

## 2. Use Case Diagram

This diagram shows the main actors (Admin, Project Manager, Team Member) and the actions they are permitted to perform within the system.

```mermaid
flowchart LR
    %% Actors
    Admin((Admin))
    PM((Project Manager))
    TM((Team Member))

    %% Use Cases
    subgraph WorkSync System
        UC1(Manage Users & System Roles)
        UC2(View Full System Analytics)
        UC3(Create & Manage Projects)
        UC4(Assign Members to Projects)
        UC5(Create & Assign Tasks)
        UC6(Update Task Status / Progress)
        UC7(View Assigned Projects & Tasks)
        UC8(View Personalized Dashboard)
        UC9(Receive Role-based Notifications)
        UC10(View System Activities)
    end

    %% Admin Links
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC9
    Admin --> UC10

    %% PM Links
    PM --> UC3
    PM --> UC4
    PM --> UC5
    PM --> UC8
    PM --> UC9
    PM --> UC10

    %% TM Links
    TM --> UC6
    TM --> UC7
    TM --> UC8
    TM --> UC9
```

---

## 3. Basic System Architecture Diagram

This diagram outlines how the Frontend, Backend, and Database interact with each other in the live deployment environment.

```mermaid
flowchart TD
    %% Users and Devices
    subgraph Client Environment
        Browser[Web Browser / User Device]
    end

    %% CI/CD Pipeline
    subgraph Version Control & CI/CD
        GitHub[(GitHub Repository)]
        Actions[GitHub Actions / CI Pipeline]
    end

    %% Frontend Hosting
    subgraph Frontend [Frontend Layer: Vercel]
        NextJS[Next.js App Router]
        Axios[Axios HTTP Client]
    end

    %% Backend Hosting
    subgraph Backend [Backend Layer: Railway]
        Express[Node.js + Express.js REST API]
        Auth[JWT Auth & RBAC Middleware]
        Prisma[Prisma ORM]
    end

    %% Database Hosting
    subgraph Database [Data Layer: Railway]
        MySQL[(MySQL Relational Database)]
    end

    %% Data Flow
    Browser <-->|HTTP/HTTPS / React UI| NextJS
    NextJS <-->|Axios API Requests| Express
    Express <--> Auth
    Express <-->|Prisma Queries| Prisma
    Prisma <-->|TCP Connection| MySQL

    %% CI/CD Flow
    GitHub -->|On Push to main| Actions
    Actions -.->|Build & Test| Actions
    Actions -->|Auto Deploy Frontend| Frontend
    Actions -->|Auto Deploy Backend| Backend
```
