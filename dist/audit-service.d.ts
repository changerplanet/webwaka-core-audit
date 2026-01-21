/**
 * Core Audit Service
 *
 * Provides centralized, immutable audit logging with tamper detection
 * and actor attribution.
 */
import { TenantId, AuditEventId, AuditEvent, CreateAuditEventInput, QueryAuditEventsInput, AuditEventQueryResult, TamperDetectionResult } from './types';
import { AuditStorage } from './storage';
/**
 * Audit service configuration
 */
export interface AuditServiceConfig {
    storage: AuditStorage;
}
/**
 * Audit Service
 */
export declare class AuditService {
    private storage;
    constructor(config: AuditServiceConfig);
    /**
     * Log an audit event (append-only, immutable)
     */
    logEvent(input: CreateAuditEventInput): Promise<AuditEvent>;
    /**
     * Get an audit event by ID
     */
    getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<AuditEvent | null>;
    /**
     * Query audit events with filters
     */
    queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult>;
    /**
     * Verify the integrity of the audit log for a tenant
     *
     * This checks that the event chain has not been tampered with by
     * verifying the cryptographic hash chain.
     */
    verifyIntegrity(tenantId: TenantId): Promise<TamperDetectionResult>;
    /**
     * Prove that a specific event exists and has not been tampered with
     *
     * This returns the event along with its hash and the previous event's hash,
     * allowing external verification.
     */
    proveEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{
        event: AuditEvent;
        hash: string;
        previousHash: string | null;
    } | null>;
    /**
     * Generate a unique ID
     */
    private generateId;
}
//# sourceMappingURL=audit-service.d.ts.map