/**
 * WebWaka Core Audit Service
 *
 * Provides centralized, immutable audit logging with tamper detection
 * and actor attribution.
 */
export { AuditService, AuditServiceConfig } from './audit-service';
export { TenantId, UserId, AuditEventId, ActorType, EventCategory, EventSeverity, Actor, AuditEvent, CreateAuditEventInput, QueryAuditEventsInput, AuditEventQueryResult, TamperDetectionResult, } from './types';
export { AuditStorage, InMemoryAuditStorage, } from './storage';
export { computeEventHash, verifyEventHash, computeChainHash, verifyChainIntegrity, } from './hash-utils';
export { validate, TenantIdSchema, UserIdSchema, ActorSchema, CreateAuditEventInputSchema, QueryAuditEventsInputSchema, } from './validation';
//# sourceMappingURL=index.d.ts.map