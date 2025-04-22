# System Patterns

*This file documents the system architecture, key technical decisions, design patterns, and component relationships.*

## Architecture Overview

The system follows a standard client-server architecture, containerized using Docker for deployment and development consistency.

*   **Frontend (Web):** A Next.js (React/TypeScript) application serves the user interface. It interacts with the backend via RESTful API calls. Styling is managed primarily through Tailwind CSS.
*   **Backend (API Server):** A Python application built with FastAPI provides the core business logic, data processing, and API endpoints.
*   **Database:** PostgreSQL stores application data, including user information, document metadata, and potentially conversation history. Alembic is used for schema migrations.
*   **Model Server(s):** Separate services (likely containerized) handle computationally intensive tasks like running embedding models and interacting with Large Language Models (LLMs).
*   **Background Workers:** Celery or a similar task queue system (inferred from typical RAG architectures) likely handles asynchronous tasks like document indexing.

```mermaid
graph TD
    subgraph Browser
        UI[Next.js Frontend]
    end

    subgraph Server Infrastructure (Dockerized)
        API[FastAPI Backend]
        DB[(PostgreSQL DB)]
        MS[Model Server(s)]
        Q[Task Queue / Workers]
        DS[Document Stores / Index]
    end

    UI --> API
    API --> DB
    API --> MS
    API --> Q
    API --> DS
    Q --> DS
    Q --> MS
    Q --> DB

    style Browser fill:#D6EAF8,stroke:#333,stroke-width:2px
    style Server Infrastructure (Dockerized) fill:#E8F8F5,stroke:#333,stroke-width:2px
```

## Key Technical Decisions

*   **Inherited Stack:** The core technology stack (Python/FastAPI backend, Next.js/React/TypeScript frontend, PostgreSQL DB) is inherited from the upstream Onyx project.
*   **In-Codebase Rebranding:** The decision was made to apply GrantGPT branding (textual and visual) directly within the source code files rather than through external configuration or theming layers, to ensure the fork is self-contained visually.
*   **Containerization:** Docker is used for packaging the application components, ensuring consistent environments across development, testing, and deployment.
*   **Upstream Synchronization:** Maintaining synchronization with the `upstream` Onyx repository via Git merging/rebasing is a core operational decision.

## Design Patterns

*   **RAG (Retrieval-Augmented Generation):** This is the fundamental pattern of the application, combining information retrieval from a knowledge base (documents) with generation capabilities of LLMs to answer queries.
*   **RESTful API:** The backend exposes a RESTful API for the frontend to consume.
*   **Repository Pattern:** Likely used in the backend for database interactions (common with SQLAlchemy).
*   **Dependency Injection:** FastAPI utilizes this heavily for managing dependencies like database sessions and configuration.
*   **Utility-First CSS:** Tailwind CSS is used for styling the frontend, emphasizing composition of utility classes over traditional CSS rulesets.

## Component Relationships

1.  **User Interaction:** Users interact with the GrantGPT UI built with Next.js.
2.  **API Communication:** The frontend sends requests (e.g., search queries, chat messages, document uploads) to the FastAPI backend API.
3.  **Backend Processing:** The backend processes requests, orchestrating interactions with:
    *   **Database (PostgreSQL):** For retrieving/storing user data, configurations, document metadata.
    *   **Model Server(s):** For generating embeddings, running LLM queries/chats.
    *   **Document Stores/Index (e.g., Vespa, Qdrant):** For retrieving relevant document chunks based on user queries.
    *   **Task Queue:** For offloading long-running tasks like document ingestion and indexing.
4.  **Response:** The backend sends responses back to the frontend, which updates the UI accordingly.
5.  **Asynchronous Indexing:** Document uploads trigger background tasks (via the task queue) that process the document, generate embeddings (via Model Server), and update the document index.
