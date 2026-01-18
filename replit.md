# webwaka-core-audit

## Overview
This is a TypeScript library package that provides centralized, immutable audit logging with cryptographic tamper detection. It is designed to be used as a dependency in other projects, not as a standalone web application.

## Project Architecture

### Type
NPM Library Package (not a web application)

### Language & Runtime
- **Language**: TypeScript
- **Runtime**: Node.js 20
- **Build**: TypeScript Compiler (tsc)
- **Testing**: Jest with ts-jest

### Directory Structure
```
src/
  index.ts          - Main entry point, exports all public APIs
  audit-service.ts  - Core AuditService class
  storage.ts        - Storage interface and InMemoryAuditStorage implementation
  types.ts          - TypeScript type definitions and enums
  validation.ts     - Zod validation schemas
  hash-utils.ts     - Cryptographic hash utilities
  *.test.ts         - Jest test files
dist/               - Compiled JavaScript output (generated)
```

### Key Features
- Immutable audit log with append-only storage
- Cryptographic hash chaining for tamper detection
- Actor attribution (user, system, service)
- Event categorization (security, financial, administrative, data, system)
- Tenant isolation
- Pluggable storage backends

## Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type check without emitting

## Dependencies
- **zod**: Runtime validation library
- **DevDependencies**: TypeScript, Jest, ESLint, ts-jest

## Notes
- This is a library meant to be published to npm and used in other projects
- No web server or frontend included
- All 17 tests pass
