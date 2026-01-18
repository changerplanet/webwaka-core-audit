/**
 * WebWaka Core Audit Service
 * 
 * Provides centralized, immutable audit logging with tamper detection
 * and actor attribution.
 */

// Main service
export { AuditService, AuditServiceConfig } from './audit-service';

// Types
export {
  TenantId,
  UserId,
  AuditEventId,
  ActorType,
  EventCategory,
  EventSeverity,
  Actor,
  AuditEvent,
  CreateAuditEventInput,
  QueryAuditEventsInput,
  AuditEventQueryResult,
  TamperDetectionResult,
} from './types';

// Storage interfaces
export {
  AuditStorage,
  InMemoryAuditStorage,
} from './storage';

// Hash utilities
export {
  computeEventHash,
  verifyEventHash,
  computeChainHash,
  verifyChainIntegrity,
} from './hash-utils';

// Validation
export {
  validate,
  TenantIdSchema,
  UserIdSchema,
  ActorSchema,
  CreateAuditEventInputSchema,
  QueryAuditEventsInputSchema,
} from './validation';
