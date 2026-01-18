# webwaka-core-audit

## Overview
This is a TypeScript library package that provides centralized, immutable audit logging with cryptographic tamper detection. It is designed to be used as a dependency in other projects, not as a standalone web application.

This is Phase 2 / Step 04 of the WebWaka Modular Rebuild.

## Project Architecture

### Type
NPM Library Package (headless, no UI)

### Language & Runtime
- **Language**: TypeScript only
- **Runtime**: Node.js 20
- **Build**: TypeScript Compiler (tsc)
- **Testing**: Jest with ts-jest
- **Validation**: Zod
- **Crypto**: Node.js crypto (SHA-256)

### Directory Structure
```
src/
  index.ts          - Main entry point, exports all public APIs
  audit-service.ts  - Core AuditService class
  storage.ts        - Storage interface and InMemoryAuditStorage implementation
  types.ts          - TypeScript type definitions and enums
  validation.ts     - Zod validation schemas
  hash-utils.ts     - Cryptographic hash utilities (SHA-256)
  *.test.ts         - Jest test files
dist/               - Compiled JavaScript output (generated)
```

### Key Features
- Immutable audit log with append-only storage
- Cryptographic hash chaining for tamper detection (SHA-256)
- Actor attribution (user, system, service)
- Event categorization (security, financial, administrative, data, system)
- Tenant isolation (strict boundaries, tenant-scoped queries)
- Pluggable storage backends (AuditStorage interface)
- Integrity verification and event proof generation

## Public APIs
- `logEvent(input)` - Log an audit event
- `getEvent(tenantId, eventId)` - Retrieve an event by ID
- `queryEvents(input)` - Query events with filters
- `verifyIntegrity(tenantId)` - Verify the integrity of the audit log
- `proveEvent(tenantId, eventId)` - Generate cryptographic proof for an event

## Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run test` - Run Jest tests (with coverage)
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type check without emitting

## Dependencies
- **zod**: Runtime validation library
- **DevDependencies**: TypeScript, Jest, ESLint, ts-jest

## Test Coverage
- 27 tests passing
- 96.4% statement coverage
- 100% function coverage
- 100% line coverage
- Includes hard stop condition test proving tamper detection

## Notes
- This is a library meant to be published to npm and used in other projects
- No web server, frontend, or database included
- Depends on webwaka-core-identity (logical dependency for userId/tenantId context)
