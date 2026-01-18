/**
 * Core Audit Service
 * 
 * Provides centralized, immutable audit logging with tamper detection
 * and actor attribution.
 */

import { randomBytes } from 'crypto';
import {
  TenantId,
  AuditEventId,
  AuditEvent,
  CreateAuditEventInput,
  QueryAuditEventsInput,
  AuditEventQueryResult,
  TamperDetectionResult,
} from './types';
import {
  validate,
  CreateAuditEventInputSchema,
  QueryAuditEventsInputSchema,
  TenantIdSchema,
} from './validation';
import { AuditStorage } from './storage';
import { computeEventHash, verifyChainIntegrity } from './hash-utils';

/**
 * Audit service configuration
 */
export interface AuditServiceConfig {
  storage: AuditStorage;
}

/**
 * Audit Service
 */
export class AuditService {
  private storage: AuditStorage;

  constructor(config: AuditServiceConfig) {
    this.storage = config.storage;
  }

  /**
   * Log an audit event (append-only, immutable)
   */
  async logEvent(input: CreateAuditEventInput): Promise<AuditEvent> {
    const validated = validate(CreateAuditEventInputSchema, input);

    // Generate event ID
    const eventId = this.generateId();

    const event: AuditEvent = {
      eventId,
      tenantId: validated.tenantId,
      timestamp: new Date(),
      actor: validated.actor,
      category: validated.category,
      severity: validated.severity,
      action: validated.action,
      resource: validated.resource,
      outcome: validated.outcome,
      details: validated.details,
      metadata: validated.metadata,
      ipAddress: validated.ipAddress,
      userAgent: validated.userAgent,
    };

    // Get previous event hash for chain linking
    const previousHash = await this.storage.getPreviousEventHash(validated.tenantId);

    // Compute hash for tamper detection
    const hash = computeEventHash(event, previousHash || undefined);

    // Store event with hash
    return this.storage.appendEvent(event, hash);
  }

  /**
   * Get an audit event by ID
   */
  async getEvent(tenantId: TenantId, eventId: AuditEventId): Promise<AuditEvent | null> {
    validate(TenantIdSchema, tenantId);
    const record = await this.storage.getEvent(tenantId, eventId);
    return record ? record.event : null;
  }

  /**
   * Query audit events with filters
   */
  async queryEvents(input: QueryAuditEventsInput): Promise<AuditEventQueryResult> {
    const validated = validate(QueryAuditEventsInputSchema, input);
    return this.storage.queryEvents(validated);
  }

  /**
   * Verify the integrity of the audit log for a tenant
   * 
   * This checks that the event chain has not been tampered with by
   * verifying the cryptographic hash chain.
   */
  async verifyIntegrity(tenantId: TenantId): Promise<TamperDetectionResult> {
    validate(TenantIdSchema, tenantId);

    const records = await this.storage.getAllEvents(tenantId);
    
    if (records.length === 0) {
      return { intact: true };
    }

    const events = records.map(r => r.event);
    const storedHashes = records.map(r => r.hash);

    const result = verifyChainIntegrity(events, storedHashes);

    if (!result.intact && result.firstBrokenIndex !== undefined) {
      const affectedEvents = events
        .slice(result.firstBrokenIndex)
        .map(e => e.eventId);

      return {
        intact: false,
        reason: `Chain integrity broken at event index ${result.firstBrokenIndex}`,
        affectedEvents,
      };
    }

    return { intact: true };
  }

  /**
   * Prove that a specific event exists and has not been tampered with
   * 
   * This returns the event along with its hash and the previous event's hash,
   * allowing external verification.
   */
  async proveEvent(tenantId: TenantId, eventId: AuditEventId): Promise<{
    event: AuditEvent;
    hash: string;
    previousHash: string | null;
  } | null> {
    validate(TenantIdSchema, tenantId);

    const record = await this.storage.getEvent(tenantId, eventId);
    if (!record) {
      return null;
    }

    // Get all events to find the previous one
    const allRecords = await this.storage.getAllEvents(tenantId);
    const eventIndex = allRecords.findIndex(r => r.event.eventId === eventId);
    
    const previousHash = eventIndex > 0 ? allRecords[eventIndex - 1].hash : null;

    return {
      event: record.event,
      hash: record.hash,
      previousHash,
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return randomBytes(16).toString('hex');
  }
}
