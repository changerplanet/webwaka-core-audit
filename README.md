# webwaka-core-audit

**Type:** core  
**Description:** Audit logging and compliance tracking core service

## Status

✅ **Phase 2.3 Complete** - Core audit service implemented and tested.

This module provides production-grade immutable audit logging with cryptographic tamper detection and strict tenant isolation.

## Features

- **Immutable Audit Log**: Append-only storage with no updates or deletes
- **Tamper Detection**: Cryptographic hash chaining (blockchain-like)
- **Actor Attribution**: Track user, system, or service actions
- **Event Categories**: Security, financial, administrative, data, system
- **Integrity Verification**: Verify entire log or specific events
- **Storage Abstraction**: Pluggable storage backends for flexibility

## Installation

```bash
pnpm install
```

## Usage

```typescript
import { AuditService, InMemoryAuditStorage, ActorType, EventCategory, EventSeverity } from 'webwaka-core-audit';

// Create service instance
const auditService = new AuditService({
  storage: new InMemoryAuditStorage(),
});

// Log a security event
await auditService.logEvent({
  tenantId: 'tenant-1',
  actor: {
    type: ActorType.USER,
    id: 'user-1',
    tenantId: 'tenant-1',
  },
  category: EventCategory.SECURITY,
  severity: EventSeverity.INFO,
  action: 'user.login',
  outcome: 'success',
  ipAddress: '192.168.1.1',
});

// Query events
const result = await auditService.queryEvents({
  tenantId: 'tenant-1',
  category: EventCategory.SECURITY,
});

// Verify integrity
const integrity = await auditService.verifyIntegrity('tenant-1');
console.log(integrity.intact); // true
```

## Testing

```bash
pnpm test
```

## Documentation

- [Module Contract](./module.contract.md) - Defines the module's capabilities, dependencies, and API surface
- [Changelog](./CHANGELOG.md) - Version history and changes
- [Security Policy](./SECURITY.md) - Security guidelines and vulnerability reporting
- [Owners](./OWNERS.md) - Maintainers and code review requirements

## Module Manifest

See `module.manifest.json` for the complete module specification.

## Contributing

This module follows the WebWaka architectural rules:
- All changes must go through pull requests
- CI/CD checks must pass before merging
- Manifest validation is enforced automatically

## License

MIT
