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
  getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{ event: AuditEvent; hash: string } | null>;

  /**
   * Query audit events with filters
   */
  queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult>;

  /**
   * Get all events in chronological order (for chain verification)
   */
  getAllEvents(tenantId: TenantId): Promise<Array<{ event: AuditEvent; hash: string }>>;

  /**
   * Get the hash of the previous event (for chain linking)
   */
  getPreviousEventHash(tenantId: TenantId): Promise<string | null>;
}

/**
 * In-memory implementation for testing
 */
export class InMemoryAuditStorage implements AuditStorage {
  private events: Map<string, { event: AuditEvent; hash: string }> = new Map();
  private eventsByTenant: Map<TenantId, Array<{ event: AuditEvent; hash: string }>> = new Map();

  private getKey(tenantId: TenantId, eventId: AuditEventId): string {
    return `${tenantId}:${eventId}`;
  }

  async appendEvent(event: AuditEvent, hash: string): Promise<AuditEvent> {
    const key = this.getKey(event.tenantId, event.eventId);
    
    if (this.events.has(key)) {
      throw new Error(`Event already exists: ${event.eventId}`);
    }

    const record = { event, hash };
    this.events.set(key, record);

    // Add to tenant index
    if (!this.eventsByTenant.has(event.tenantId)) {
      this.eventsByTenant.set(event.tenantId, []);
    }
    this.eventsByTenant.get(event.tenantId)!.push(record);

    return event;
  }

  async getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{ event: AuditEvent; hash: string } | null> {
    const key = this.getKey(tenantId, eventId);
    return this.events.get(key) || null;
  }

  async queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult> {
    const tenantEvents = this.eventsByTenant.get(input.tenantId) || [];
    
    // Apply filters
    const filtered = tenantEvents.filter(record => {
      const event = record.event;
      
      if (input.actorId && event.actor.id !== input.actorId) return false;
      if (input.category && event.category !== input.category) return false;
      if (input.severity && event.severity !== input.severity) return false;
      if (input.action && event.action !== input.action) return false;
      if (input.resource && event.resource !== input.resource) return false;
      if (input.outcome && event.outcome !== input.outcome) return false;
      if (input.startTime && event.timestamp < input.startTime) return false;
      if (input.endTime && event.timestamp > input.endTime) return false;
      
      return true;
    });

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.event.timestamp.getTime() - a.event.timestamp.getTime());

    const total = filtered.length;
    const limit = input.limit || 100;
    const offset = input.offset || 0;

    const events = filtered
      .slice(offset, offset + limit)
      .map(record => record.event);

    return {
      events,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getAllEvents(tenantId: TenantId): Promise<Array<{ event: AuditEvent; hash: string }>> {
    const tenantEvents = this.eventsByTenant.get(tenantId) || [];
    // Return in chronological order (oldest first)
    return [...tenantEvents].sort((a, b) => 
      a.event.timestamp.getTime() - b.event.timestamp.getTime()
    );
  }

  async getPreviousEventHash(tenantId: TenantId): Promise<string | null> {
    const tenantEvents = this.eventsByTenant.get(tenantId) || [];
    if (tenantEvents.length === 0) {
      return null;
    }
    return tenantEvents[tenantEvents.length - 1].hash;
  }
}
