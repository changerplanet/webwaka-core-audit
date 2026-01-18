# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Core audit service implementation
- Immutable append-only audit log
- Cryptographic hash chaining for tamper detection
- Actor attribution (user, system, service)
- Event categories (security, financial, administrative, data, system)
- Event severity levels (info, warning, error, critical)
- Event querying with filters
- Integrity verification methods
- Event proof generation
- Storage abstraction layer (AuditStorage)
- In-memory storage implementation for testing
- Comprehensive test suite with immutability verification
- TypeScript type definitions and interfaces
- Input validation with Zod schemas
- ESLint and TypeScript configuration

## [0.1.0] - 2026-01-18

### Added
- Initial commit with governance structure
