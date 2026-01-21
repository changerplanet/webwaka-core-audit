/**
 * Storage interface for audit data
 */
import { TenantId, AuditEvent, AuditEventId, QueryAuditEventsInput, AuditEventQueryResult } from './types';
/**
 * Storage interface for audit events
 *
 * This is an append-only interface - there is no update or delete method.
 */
export interface AuditStorage {
    /**
     * Append a new audit event (immutable, no updates allowed)
     */
    appendEvent(event: AuditEvent, hash: string): Promise<AuditEvent>;
    /**
     * Get an audit event by ID
     */
    getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{
        event: AuditEvent;
        hash: string;
    } | null>;
    /**
     * Query audit events with filters
     */
    queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult>;
    /**
     * Get all events in chronological order (for chain verification)
     */
    getAllEvents(tenantId: TenantId): Promise<Array<{
        event: AuditEvent;
        hash: string;
    }>>;
    /**
     * Get the hash of the previous event (for chain linking)
     */
    getPreviousEventHash(tenantId: TenantId): Promise<string | null>;
}
/**
 * In-memory implementation for testing
 */
export declare class InMemoryAuditStorage implements AuditStorage {
    private events;
    private eventsByTenant;
    private getKey;
    appendEvent(event: AuditEvent, hash: string): Promise<AuditEvent>;
    getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{
        event: AuditEvent;
        hash: string;
    } | null>;
    queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult>;
    getAllEvents(tenantId: TenantId): Promise<Array<{
        event: AuditEvent;
        hash: string;
    }>>;
    getPreviousEventHash(tenantId: TenantId): Promise<string | null>;
}
//# sourceMappingURL=storage.d.ts.map