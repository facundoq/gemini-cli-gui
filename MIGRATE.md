# TypeScript Migration Plan for Server

This document outlines the plan to complete the migration of the `server/` directory to TypeScript.

## Current Status

- All `.js` files in `server/` have been renamed to `.ts`.
- `tsx` is used for development and running the server.
- Basic TypeScript support is enabled via `server/tsconfig.json`.
- **In Progress**: Centralizing type definitions and refactoring core logic.

## Goals

- **Strict Type Safety**: Eliminate `any` and use specific interfaces/types.
- **Dedicated Configuration**: Separate server TS configuration from frontend (Done).
- **Robust Build Process**: Ensure the server can be compiled to JS for production.
- **Improved Maintainability**: Centralized types and better organized code.
- **Runtime Validation**: Use Zod for API request validation.

## Phase 1: Environment Setup (COMPLETED)

1.  **Dedicated Server TSConfig**: Created `server/tsconfig.json`.
2.  **Update `package.json` Scripts**: Added `server:dev`, `server:build`, and `server:start`.

## Phase 2: Centralized Type Definitions (IN PROGRESS)

1.  **Create/Update Type Files**:
    - `server/types/project.ts`: `Project`, `ProjectConfig`, `FileItem`. (Update `sessions: any[]`)
    - `server/types/session.ts`: `Session`, `Message`, `SessionMeta`.
    - `server/types/auth.ts`: `User`, `AuthRequest`, `TokenPayload`.
    - `server/types/index.ts`: Export all types (Done).

2.  **Add Missing Types**:
    - `server/types/gemini.ts`: `GeminiOptions`, `GeminiProcess`, `GeminiResponse`.
    - `server/types/express.ts`: Extend `Request` for `user` property.

## Phase 3: Systematic Refactoring (NEXT)

Migrate files to use the new types and eliminate `any`:

1.  **Utilities & Database**:
    - `server/database/db.ts`: Type database operations.
2.  **Core Logic**:
    - `server/projects.ts`: Fully type project management logic, replace `any`.
    - `server/sessionManager.ts`: Type session tracking and management.
    - `server/gemini-cli.ts`: Type process spawning and communication.
    - `server/gemini-response-handler.ts`: Type response parsing logic.
3.  **Middleware & Routes**:
    - `server/middleware/auth.ts`: Type Express middleware properly.
    - `server/routes/*.ts`: Type route handlers and request/response bodies.
4.  **Entry Point**:
    - `server/index.ts`: Final cleanup and strict typing of the Express app.

## Phase 4: Import Cleanup

- Standardize imports across all `.ts` files.
- Ensure all relative imports use `.ts` or no extension (compatible with `NodeNext`).
- Remove any remaining `.js` references in imports.

## Phase 5: Validation & Production Readiness

1.  **Strict Build**: Run `npm run server:build` and fix all compilation errors.
2.  **Production Test**: Verify the server runs correctly from `dist/server/index.js`.
3.  **CI Integration**: Add `npm run server:build` to the pre-commit or CI pipeline.

## Phase 6: Enhancements (Post-Migration)

1.  **Zod Integration**: Add `zod` for runtime validation of API requests and environment variables.
2.  **Error Handling**: Implement a centralized, type-safe error handling middleware.
3.  **Type-safe Events**: Define types for WebSocket events.

## Implementation Guidelines

- **Prefer Interfaces**: Use `interface` for data structures that might be extended.
- **Avoid `any`**: Use `unknown` or specific types. Use `as` assertions only when absolutely necessary.
- **Express Typing**: Use `Request`, `Response`, and `NextFunction` from `express`.
- **Strict Null Checks**: Ensure all code handles `null` and `undefined` properly.
