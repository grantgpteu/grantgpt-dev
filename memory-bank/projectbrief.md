# projectbrief.md

## The Foundation of Your Project

Synchronizing the GrantGPT codebase with the latest source code from the upstream Onyx repository, applying rebranding (name changes, visual styling) directly within the code, while preserving all Git-ignored files. All development work will be pushed only to the GrantGPT `origin` repository fork.

## High-Level Overview

This project involves synchronizing a forked RAG system's codebase (GrantGPT) with its original upstream source (Onyx), applying updates, and performing a comprehensive rebranding directly within the source files. The workflow involves fetching the latest code changes from the upstream Onyx repository (`https://github.com/onyx-dot-app/onyx.git`) and merging/rebasing these into the local GrantGPT working branch. Following the code update, the codebase will be modified to rebrand from "Onyx" to "GrantGPT" (textual references, color scheme in relevant files like CSS/config). Crucially, all files and directories specified in the project's `.gitignore` file must be preserved, and code changes must *only* be pushed to the designated GrantGPT `origin` repository (e.g., `https://github.com/grantgpteu/grantgpt-dev.git` or `https://github.com/grantgpteu/grantgpt-v20241111.git`), never to the upstream Onyx repository.

## Core Requirements and Goals

1.  **Source Code Management & Synchronization (Git Workflow):**
    * **Configure Remotes:** Ensure Git remotes are configured correctly:
        * `origin`: The GrantGPT fork repository (e.g., `https://github.com/grantgpteu/grantgpt-dev.git` or `https://github.com/grantgpteu/grantgpt-v20241111.git`) (fetch & push)
        * `upstream`: `https://github.com/onyx-dot-app/onyx.git` (fetch only)
    * **Fetch Upstream Changes:** Regularly fetch the latest changes from the `upstream` repository (e.g., `git fetch upstream`).
    * **Integrate Changes:** Merge or rebase the relevant branch from `upstream` (e.g., `upstream/main`) into the local working branch for GrantGPT. Resolve any merge conflicts carefully, focusing on integrating upstream updates while preserving GrantGPT-specific changes where necessary.
    * **Push Constraint:** **Strictly ensure that no changes are ever pushed to the `upstream` repository.** All pushes must target the configured `origin` repository.
    * **Goal:** Keep the GrantGPT codebase synchronized with the latest developments from the original Onyx project while maintaining a separate development history in the GrantGPT fork's `origin` repository.

2.  **Preserve Ignored Files and Configuration:**
    * **Crucially, ensure that any files or directories listed in the project's `.gitignore` file are *not* overwritten or unintentionally modified** during the code integration, update, or rebranding process. This includes `.env` files, local configurations, logs, build artifacts, etc.
    * Use Git's conflict resolution mechanisms carefully, back up critical ignored files before major operations like rebasing, or manually merge changes if needed within configuration files (while respecting their ignored status).
    * **Goal:** Maintain operational configuration integrity and prevent loss of local, environment-specific, or ignored files during code updates.

3.  **Rebrand Name in Codebase:**
    * Identify all instances where the name "Onyx" appears within the source code files tracked by Git (e.g., in UI text, comments, non-sensitive configuration values, documentation within the repository).
    * Replace every identified instance of "Onyx" with "GrantGPT". Commit these changes to the local GrantGPT branch intended for push to `origin`.
    * **Goal:** The codebase should consistently reflect the "GrantGPT" name in all relevant tracked files within the GrantGPT repository.

4.  **Apply New Visual Styling in Codebase:**
    * Consult the design specifications located in `/memory-bank/design-guidelines.md`.
    * Identify the relevant CSS, SCSS, or other styling files within the codebase that are tracked by Git.
    * Modify the styling rules within these files to implement the color palette and visual guidelines defined for GrantGPT. Commit these changes to the local GrantGPT branch intended for push to `origin`.
    * **Goal:** The codebase's styling files should reflect the GrantGPT brand identity, ensuring that if the code were to be built or deployed, it would use the correct visuals.

5.  **Verification:**
    * After integrating upstream changes and applying rebranding/styling to the codebase: verify the process.
    * Confirm successful fetching and merging/rebasing of upstream code without errors, reviewing integrated changes.
    * Verify that rebranding changes (text 'Onyx' to 'GrantGPT') and styling modifications (colors per guidelines) are correctly applied within the relevant source code files by inspecting the diffs or the code itself.
    * Confirm that files and directories listed in `.gitignore` remain unchanged by the process (e.g., via `git status --ignored` or checking modification times).
    * Ensure Git status reflects only the intended, committed changes on the correct local branch destined for the `origin` repository.
    * Verify that no pushes were made to the `upstream` repository (e.g., check `git log --branches --remotes`).
    * **Goal:** Deliver an updated GrantGPT codebase, correctly synchronized with upstream, fully rebranded and restyled within the source files, with all ignored files preserved, and all changes correctly committed *only* to the appropriate `origin` repository.