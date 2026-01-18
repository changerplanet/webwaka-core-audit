/**
 * Core type definitions for the Audit service
 */

/**
 * Tenant identifier
 */
export type TenantId = string;

/**
 * User identifier
 */
export type UserId = string;

/**
 * Audit event identifier
 */
export type AuditEventId = string;

/**
 * Actor type in an audit event
 */
export enum ActorType {
  USER = 'user',
  SYSTEM = 'system',
  SERVICE = 'service',
}

/**
 * Event category
 */
export enum EventCategory {
  SECURITY = 'security',
  FINANCIAL = 'financial',
  ADMINISTRATIVE = 'administrative',
  DATA = 'data',
  SYSTEM = 'system',
}

/**
 * Event severity
 */
export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Actor information
 */
export interface Actor {
  type: ActorType;
  id: string;              // userId, serviceId, or 'system'
  tenantId?: TenantId;     // Optional for system actors
  metadata?: Record<string, unknown>;
}

/**
 * Audit event
 */
export interface AuditEvent {
  eventId: AuditEventId;
  tenantId: TenantId;
  timestamp: Date;
  actor: Actor;
  category: EventCategory;
  severity: EventSeverity;
  action: string;          // e.g., "user.login", "sale.created", "refund.issued"
  resource?: string;       // e.g., "sale:12345", "user:67890"
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit event input
 */
export interface CreateAuditEventInput {
  tenantId: TenantId;
  actor: Actor;
  category: EventCategory;
  severity: EventSeverity;
  action: string;
  resource?: string;
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Query audit events input
 */
export interface QueryAuditEventsInput {
  tenantId: TenantId;
  actorId?: string;
  category?: EventCategory;
  severity?: EventSeverity;
  action?: string;
  resource?: string;
  outcome?: 'success' | 'failure';
  startTime?: Date;
  endTime?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Audit event query result
 */
export interface AuditEventQueryResult {
  events: AuditEvent[];
  total: number;
  hasMore: boolean;
}

/**
 * Tamper detection result
 */
export interface TamperDetectionResult {
  intact: boolean;
  reason?: string;
  affectedEvents?: AuditEventId[];
}
