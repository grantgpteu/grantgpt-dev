# Product Context

*This file outlines the "why" behind the project, the problems it solves, how it should work, and user experience goals.*

## Problem Statement

Maintaining a derivative software product (GrantGPT) based on an actively developed open-source project (Onyx) presents challenges. GrantGPT needs to incorporate the latest features and bug fixes from Onyx while simultaneously establishing its own distinct brand identity (name, visuals) and ensuring its specific operational configurations (like Git-ignored files) are preserved during updates. Manually performing these synchronizations and rebranding steps is time-consuming, error-prone, and risks introducing inconsistencies or breaking functionality.

## Goals

1.  **Maintain Upstream Sync:** Ensure the GrantGPT codebase can be regularly and reliably updated with the latest changes from the upstream Onyx repository.
2.  **Consistent Rebranding:** Apply and maintain the GrantGPT brand identity (name "GrantGPT", visual styles from `design-guidelines.md`) consistently across the entire user-facing application codebase.
3.  **Operational Integrity:** Guarantee that the synchronization and rebranding process does not delete, overwrite, or corrupt critical Git-ignored files (e.g., `.env`, local configurations, logs).
4.  **Correct Git Workflow:** Enforce a strict Git workflow where changes are fetched from `upstream` (Onyx) but *only* pushed to `origin` (GrantGPT fork). Prevent accidental pushes to the upstream repository.
5.  **Streamlined Workflow:** Define and document a repeatable process (potentially automatable in the future) for performing these updates and rebranding tasks.

## Target Users

*   **GrantGPT Developers/Maintainers:** Individuals responsible for keeping the GrantGPT codebase synchronized with Onyx, applying branding, and deploying the application.
*   **End-Users of GrantGPT:** Users interacting with the deployed GrantGPT application, who expect a consistent brand experience and the latest RAG features.

## Key Features & Functionality (from a Product Perspective)

*   **Core RAG Capabilities:** Inherits all core Retrieval-Augmented Generation features from the synchronized version of Onyx (e.g., document ingestion, semantic search, chat with sources).
*   **GrantGPT Branding:** The user interface consistently displays the "GrantGPT" name and adheres to the visual styles (colors, fonts, layouts) defined in `design-guidelines.md`.
*   **Up-to-Date Functionality:** Provides users with features and fixes recently added to the upstream Onyx project.

## User Experience Principles

*   **Brand Consistency:** The application should feel like a cohesive GrantGPT product, distinct from Onyx, across all views and interactions.
*   **Reliability:** Users should experience a stable application, benefiting from upstream bug fixes without disruptions caused by the sync/rebrand process.
*   **Clarity:** UI text and elements should clearly reflect the GrantGPT identity.
