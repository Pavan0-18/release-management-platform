# Release Management Platform

Enterprise-grade full-stack platform for release governance, deployment tracking, and multi-tenant release management.

---

## 1. Project Overview

**Release Management Platform** is a production-quality platform designed to govern, orchestrate, and audit software releases across diverse environments and organizations.

This repository represents the initial foundation setup of the platform, structured as a high-performance monorepo ready for extensible multi-tenant scaling.

---

## 2. Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) (Node.js framework), [TypeScript](https://www.typescriptlang.org/)
- **API Paradigm**: [GraphQL](https://graphql.org/) (Code-first approach via `@nestjs/graphql` & [Apollo Server](https://www.apollographql.com/))
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Apollo Client](https://www.apollographql.com/docs/react/), [React Router](https://reactrouter.com/)
- **Monorepo Management**: [pnpm Workspaces](https://pnpm.io/workspaces)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Testing**: [Jest](https://jestjs.io/) (Backend) & [Vitest](https://vitest.dev/) (Frontend)
- **Code Quality**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

---

## 3. Architecture

```text
release-management-platform/
├── apps/
│   ├── api/                   # NestJS GraphQL Backend with Prisma
│   └── web/                   # React + Vite Frontend SPA
│
├── packages/
│   ├── shared/                # Shared TypeScript types and constants
│   └── config/                # Shared tsconfig and tooling configs
│
├── docker/                    # Dockerfiles for API and Web services
├── docs/                      # Architectural docs and roadmaps
├── .github/workflows/         # CI validation pipeline
├── docker-compose.yml         # Container composition (Postgres, API, Web)
├── .env.example               # Template environment configuration
└── pnpm-workspace.yaml        # Workspace configuration
```

### Future Multi-Tenant Model

```text
                    Platform
                       │
             ┌─────────┴─────────┐
             │                   │
       Organization A       Organization B
             │                   │
        ┌────┴────┐         ┌────┴────┐
        │         │         │         │
     Project A  Project B  Project C Project D
        │
   ┌────┼──────────────┐
   │    │              │
Release Environment  Members
   │
Steps
```

---

## 4. Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (v10+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose

### Quick Start

1. **Clone the repository and enter the directory**:

   ```bash
   cd release-management-platform
   ```

2. **Install all dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

4. **Start PostgreSQL database** (via Docker Compose):

   ```bash
   docker compose up -d postgres
   ```

5. **Generate Prisma Client and push schema**:

   ```bash
   pnpm db:generate
   pnpm --filter @rmp/api prisma:push
   ```

6. **Start both backend and frontend in development mode**:
   ```bash
   pnpm dev
   ```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend GraphQL Endpoint & Playground: [http://localhost:3000/graphql](http://localhost:3000/graphql)

---

## 5. Environment Variables

All available environment variables are documented in `.env.example`:

| Variable             | Description                                               | Default                                                                          |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `NODE_ENV`           | Runtime environment (`development`, `test`, `production`) | `development`                                                                    |
| `PORT`               | API server port                                           | `3000`                                                                           |
| `API_HOST`           | API host binding                                          | `0.0.0.0`                                                                        |
| `DATABASE_URL`       | PostgreSQL connection string for Prisma                   | `postgresql://postgres:postgres@localhost:5432/release_management?schema=public` |
| `CORS_ORIGIN`        | Allowed CORS origins for the API                          | `http://localhost:5173`                                                          |
| `GRAPHQL_PATH`       | GraphQL route path                                        | `/graphql`                                                                       |
| `GRAPHQL_PLAYGROUND` | Enable Apollo GraphQL Playground                          | `true`                                                                           |
| `VITE_API_URL`       | GraphQL API URL for frontend                              | `http://localhost:3000/graphql`                                                  |

---

## 6. Docker

To run the complete platform infrastructure via Docker:

```bash
# Build and launch all containers (Postgres, API, and Web)
docker compose up --build

# Run in detached mode
docker compose up -d

# Stop all containers
docker compose down
```

The PostgreSQL container uses a persistent named volume (`postgres_data`) ensuring data persistence between restarts.

---

## 7. Testing

Execute unit and smoke tests across all workspace packages:

```bash
# Run all tests
pnpm test

# Run API unit tests
pnpm --filter @rmp/api test

# Run Web frontend unit tests
pnpm --filter @rmp/web test
```

---

## 8. GraphQL

The backend utilizes NestJS GraphQL with a **code-first approach**.

- **Endpoint**: `POST http://localhost:3000/graphql`
- **Playground**: `http://localhost:3000/graphql`

### Example Health Queries

```graphql
# Basic health query
query Health {
  health
}

# Detailed health check query
query HealthStatus {
  healthStatus {
    status
    database
    uptime
    environment
    timestamp
  }
}
```

---

## 9. Future Roadmap

The platform architecture is designed for progressive expansion through the following phases:

1. **Phase 1 — Release Checklist**: Release steps, verification checklists, and status transitions.
2. **Phase 2 — Projects**: Project partitioning, metadata, and service catalogs.
3. **Phase 3 — Organizations**: Multi-tenant isolation and organization settings.
4. **Phase 4 — Users and Memberships**: User identities, authentication, and multi-org memberships.
5. **Phase 5 — RBAC**: Role-based access control (Owner, Admin, Release Manager, Developer, Viewer).
6. **Phase 6 — ABAC**: Dynamic attribute-based authorization policies (environment, ownership, time-window).
7. **Phase 7 — Audit Logging**: Comprehensive, tamper-evident audit trails for all operations.
8. **Phase 8 — Environments**: Deployment target environments, freeze windows, and promotion stages.
9. **Phase 9 — Approval Workflows**: Multi-stage approvals, release gates, and quorum enforcement.
10. **Phase 10 — Release Analytics**: Velocity metrics, deployment frequency, failure rates, and lead times.
