# Tech Context

*This file details the technologies used, development setup, technical constraints, and dependencies.*

## Core Technologies

*   **Backend:** Python (likely FastAPI based on Onyx structure), PostgreSQL (inferred from Alembic usage), Docker.
*   **Frontend:** Next.js (v13+ likely, given Onyx patterns), React, TypeScript, Tailwind CSS, Docker.
*   **Database:** PostgreSQL.
*   **Infrastructure:** Docker (for local development and deployment), Git (for version control).
*   **Key Libraries/Frameworks:**
    *   Backend: FastAPI, SQLAlchemy (likely with Alembic), Pydantic.
    *   Frontend: React, Next.js, Tailwind CSS, Shadcn/ui (likely, based on `components.json`), Playwright (for testing).

## Development Setup

*   **Prerequisites:**
    *   Git
    *   Docker & Docker Compose
    *   Python (version specified in `backend/pyproject.toml` or runtime environment)
    *   Node.js & npm/yarn (version specified in `web/package.json`)
*   **Environment Variables:** Configuration relies heavily on environment variables (e.g., database connection strings, API keys). See `.env.example` files or deployment configurations (`deployment/docker_compose/env.*.template`). **Crucially, local `.env` files are Git-ignored and must be preserved.**
*   **Backend Setup:** Typically involves setting up a Python virtual environment, installing dependencies (`pip install -r requirements/default.txt -r requirements/dev.txt`), running database migrations (`alembic upgrade head`), and starting the server (often via Docker Compose).
*   **Frontend Setup:** Typically involves installing Node modules (`npm install` or `yarn install`) and starting the development server (`npm run dev` or `yarn dev`), often via Docker Compose.
*   **Git Remotes:**
    *   `origin`: GrantGPT fork repository (e.g., `https://github.com/grantgpteu/grantgpt-v20241111.git`) - **Push targets here.**
    *   `upstream`: Onyx main repository (`https://github.com/onyx-dot-app/onyx.git`) - **Fetch only.**

## Technical Constraints

*   Must maintain compatibility with upstream Onyx for future merges/rebases where possible.
*   Rebranding must be applied directly within the codebase (text and styling).
*   Preservation of Git-ignored files (`.gitignore`) is critical during updates.
*   All development must be pushed *only* to the `origin` remote.

## Dependencies

*   Relies on the upstream Onyx codebase for core functionality.
*   External LLMs and embedding models (configured via environment variables).
*   Potentially other external services depending on configured connectors (e.g., Slack, Jira - inferred from `backend/slackbot_images/`).
