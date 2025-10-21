# Repository Guidelines

## Project Structure & Module Organization
- Backend lives in `back/` with the clean architecture stack: `src/domain` for entities and repository contracts, `src/application` for use cases, `src/infrastructure` for Drizzle adapters, and `src/presentation` for Hono routes and Zod schemas. Shared bootstrapping (e.g., `server.ts`, `db.ts`, `scripts/`) sits at the root of `back/src`.
- Frontend code is in `front/`: `src/pages` and `src/api` hold view logic and API hooks, while `src/types` centralizes shared DTOs. Static assets stay under `public/`.

## Build, Test, and Development Commands
- Backend: `cd back && npm run dev` starts the Hono server with hot reload. Use `npm run start` for production mode. Database workflows rely on Drizzle—`npm run db:init`, `npm run db:push`, and `npm run db:seed` (after credentials are set in `.env`). `npm run db:test` checks connectivity; run it before seeding.
- Frontend: `cd front && npm run dev` launches Vite on port 5173. Ship-ready bundles come from `npm run build`, and `npm run preview` serves the compiled output. Run `npm run lint` prior to submitting PRs to keep React lint rules satisfied.

## Coding Style & Naming Conventions
- Use TypeScript everywhere; keep imports path-relative within each layer to preserve dependency direction. Follow the established two-space indentation and single-quote preference in both apps. Domain entities/interfaces stay in PascalCase (`PostRepository`), use cases in CamelCase (`createPostUseCase`), and route handlers as verb-noun (`listPostsRoute`).
- The frontend relies on the project eslint config (`eslint.config.js`); resolve all warnings. For backend files, mirror the same React/TypeScript ESLint/Prettier defaults and group pure domain code free of framework-specific utilities.

## Testing Guidelines
- No automated specs exist yet; when adding tests, colocate backend unit tests beside use cases and keep them framework-agnostic. Prefer naming files `*.spec.ts`. For integration sanity checks, hit `/health` and `/api/posts` with curl or Thunder Client after running database migrations. Maintain at least manual verification notes in PRs until Jest/Vitest harnesses are introduced.

## Commit & Pull Request Guidelines
- Existing history uses short imperative messages (often in Korean). Continue with concise verbs (`Add`, `Refactor`, `Fix`) and scope tags when helpful (`feat:`, `chore:`). One logical change per commit; documentation edits should mention the touched area (`docs:`).
- PRs should describe the motivation, summarize behavioral changes, list manual verification steps, and attach screenshots or curl snippets for API-facing updates. Link issues with `Closes #id` when applicable and call out any schema changes so reviewers can run the relevant Drizzle command.
