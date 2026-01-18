# Module Contract: Core Audit

## Purpose

The Core Audit service provides a centralized, immutable audit logging system for the WebWaka platform. It enables any module to emit audit events and later prove who did what, when, and under which tenant context. The service implements tamper detection through cryptographic hash chaining, ensuring audit log integrity.

## Capabilities

This module provides the following capabilities:

- **Immutable Audit Log**: Append-only event storage with no update or delete operations
- **Tamper Detection**: Cryptographic hash chaining to detect any modifications to the audit log
- **Actor Attribution**: Track whether an action was performed by a user, system, or service
- **Event Categories**: Support for security, financial, administrative, data, and system events
- **Tenant Isolation**: Strict tenant boundaries in all audit operations
- **Event Querying**: Filter and search audit events by multiple criteria
- **Integrity Verification**: Verify the integrity of the entire audit log or specific events

## Dependencies

This module depends on:

- **webwaka-core-identity**: For user and tenant context (logical dependency, not code coupling)

The audit service operates on `userId` and `tenantId` values that are resolved by the identity service, but does not directly call identity service methods.

## API Surface

### Public Interfaces

#### AuditService

The main service class that provides all audit operations.

```typescript
class AuditService {
  constructor(config: AuditServiceConfig);
  
  // Event logging
  logEvent(input: CreateAuditEventInput): Promise<AuditEvent>;
  
  // Event retrieval
  getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<AuditEvent | null>;
  queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult>;
  
  // Integrity verification
  verifyIntegrity(tenantId: TenantId): Promise<TamperDetectionResult>;
  proveEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{
    event: AuditEvent;
    hash: string;
    previousHash: string | null;
  } | null>;
}
```

#### Storage Interface

Storage abstraction for pluggable persistence backends.

```typescript
interface AuditStorage {
  appendEvent(event: AuditEvent, hash: string): Promise<AuditEvent>;
  getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{ event: AuditEvent; hash: string } | null>;
  queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult>;
  getAllEvents(tenantId: TenantId): Promise<Array<{ event: AuditEvent; hash: string }>>;
  getPreviousEventHash(tenantId: TenantId): Promise<string | null>;
}
```

### Events

This module does not emit events. It is a synchronous service that returns results directly.

## Data Models

### AuditEvent

```typescript
interface AuditEvent {
  eventId: AuditEventId;
  tenantId: TenantId;
  timestamp: Date;
  actor: Actor;
  category: EventCategory;
  severity: EventSeverity;
  action: string;              // e.g., "user.login", "sale.created", "refund.issued"
  resource?: string;           // e.g., "sale:12345", "user:67890"
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
```

### Actor

```typescript
interface Actor {
  type: ActorType;            // USER, SYSTEM, SERVICE
  id: string;                 // userId, serviceId, or 'system'
  tenantId?: TenantId;        // Optional for system actors
  metadata?: Record<string, unknown>;
}
```

### Event Categories

```typescript
enum EventCategory {
  SECURITY = 'security',           // Login, logout, permission changes
  FINANCIAL = 'financial',         // Sales, refunds, payments
  ADMINISTRATIVE = 'administrative', // Role assignments, settings changes
  DATA = 'data',                   // Data access, modifications
  SYSTEM = 'system',               // Backups, maintenance, errors
}
```

### Event Severity

```typescript
enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}
```

## Security Considerations

### Immutability

The audit log is **append-only**. There are no update or delete methods. Once an event is logged, it cannot be modified or removed. This ensures that the audit trail is permanent and tamper-evident.

### Tamper Detection

Each audit event is cryptographically hashed using SHA-256. The hash includes the event's content and the hash of the previous event, creating a blockchain-like chain. Any attempt to modify an event will break the chain, which can be detected using the `verifyIntegrity` method.

### Tenant Isolation

All audit operations enforce strict tenant isolation. Events are partitioned by `tenantId`, and queries cannot cross tenant boundaries.

### Actor Attribution

Every audit event must specify an actor (user, system, or service). This ensures that all actions can be traced back to their origin.

### Sensitive Data

Audit events should not contain sensitive data like passwords or payment card numbers. Use the `details` field judiciously and consider what information is necessary for audit purposes.

## Performance Expectations

### Storage Abstraction

The service uses a storage abstraction layer to allow for different persistence backends. The in-memory implementation is provided for testing and development. Production deployments should use a persistent, append-only storage backend (e.g., PostgreSQL with append-only tables, AWS S3, or dedicated audit log services).

### Expected Latency

- Event logging: < 100ms
- Event retrieval: < 50ms
- Event query: < 500ms (depends on query complexity and result size)
- Integrity verification: < 5s (depends on log size)

### Scalability

The service is stateless and horizontally scalable. Audit storage should be designed for high write throughput and efficient querying.

## Tamper-Resistance Guarantees

### Hash Chaining

Events are linked in a cryptographic chain where each event's hash depends on the previous event's hash. This provides the following guarantees:

1. **Modification Detection**: Any change to an event's content will change its hash, breaking the chain.
2. **Deletion Detection**: Removing an event will break the chain.
3. **Insertion Detection**: Inserting an event into the middle of the chain will break the chain.
4. **Reordering Detection**: Changing the order of events will break the chain.

### Verification

The `verifyIntegrity` method recomputes the hash chain and compares it to the stored hashes. If any discrepancy is found, it returns the index of the first broken link and the affected event IDs.

The `proveEvent` method provides cryptographic proof that a specific event exists and has not been tampered with by returning the event, its hash, and the previous event's hash.

## Versioning

This module follows semantic versioning (semver).

**Current version:** 0.1.0 (initial implementation)

### Breaking Changes

Breaking changes will increment the major version. Examples of breaking changes:
- Removing or renaming public interfaces
- Changing event data model structure
- Modifying hash computation algorithm
- Changing storage interface

### Non-Breaking Changes

Non-breaking changes will increment the minor or patch version. Examples:
- Adding new event categories or severities
- Adding new methods
- Adding optional parameters
- Performance improvements
- Bug fixes
