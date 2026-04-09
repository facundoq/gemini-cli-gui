# TypeScript Migration Plan for Server

This document outlines the plan to complete the migration of the `server/` directory to TypeScript.

## Current Status

- All `.js` files in `server/` have been renamed to `.ts`.
- `tsx` is used for development and running the server.
- Basic TypeScript support is enabled via a root `tsconfig.json`.
- **Missing**: Centralized type definitions, strict type checking in many areas, and a dedicated build process for the server.

## Goals

- **Strict Type Safety**: Eliminate `any` and use specific interfaces/types.
- **Dedicated Configuration**: Separate server TS configuration from frontend.
- **Robust Build Process**: Ensure the server can be compiled to JS for production.
- **Improved Maintainability**: Centralized types and better organized code.

## Phase 1: Environment Setup (COMPLETING)

1.  **Dedicated Server TSConfig**:
    Create `server/tsconfig.json` specifically for the server environment to ensure it doesn't conflict with Vite/frontend settings.
    ```json
    {
      "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "outDir": "../dist/server",
        "rootDir": ".",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "sourceMap": true,
        "resolveJsonModule": true,
        "types": ["node"]
      },
      "include": ["**/*.ts"],
      "exclude": ["node_modules"]
    }
    ```

2.  **Update `package.json` Scripts**:
    ```json
    {
      "scripts": {
        "server:dev": "tsx watch server/index.ts",
        "server:build": "tsc -p server/tsconfig.json",
        "server:start": "node dist/server/index.js"
      }
    }
    ```

## Phase 2: Centralized Type Definitions

Create `server/types/` to store shared interfaces:

- `server/types/project.ts`: `Project`, `ProjectConfig`, `FileItem`.
- `server/types/session.ts`: `Session`, `Message`, `SessionMeta`.
- `server/types/auth.ts`: `User`, `AuthRequest`, `TokenPayload`.
- `server/types/index.ts`: Export all types.

## Phase 3: Systematic Refactoring

Migrate files to use the new types and eliminate `any`:

1.  **Utilities & Database**:
    - `server/database/db.ts`
2.  **Core Logic**:
    - `server/projects.ts`: Fully type project management logic.
    - `server/sessionManager.ts`: Type session tracking and management.
    - `server/gemini-cli.ts`: Type process spawning and communication.
3.  **Middleware & Routes**:
    - `server/middleware/auth.ts`: Type Express middleware.
    - `server/routes/*.ts`: Type route handlers and request/response bodies.
4.  **Entry Point**:
    - `server/index.ts`: Final cleanup and strict typing.

## Phase 4: Import Cleanup

- Standardize imports across all `.ts` files.
- Remove `.ts` extensions in imports where possible (using `NodeNext` resolution).
- Ensure all relative imports are consistent.

## Phase 5: Validation & Production Readiness

1.  **Strict Build**: Run `npm run server:build` and fix all compilation errors.
2.  **Production Test**: Verify the server runs correctly from `dist/server/index.js`.
3.  **CI Integration**: (Optional) Add type checking to the CI pipeline.

## Implementation Guidelines

- **Prefer Interfaces**: Use `interface` for data structures that might be extended.
- **Avoid `any`**: Use `unknown` or specific types. Use `as` assertions only when absolutely necessary.
- **Express Typing**: Use `Request`, `Response`, and `NextFunction` from `express`.
- **Zod (Future)**: Consider adding `zod` for runtime validation of API requests.
