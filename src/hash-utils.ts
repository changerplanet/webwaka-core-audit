/**
 * Hash utilities for tamper detection
 */

import { createHash } from 'crypto';
import { AuditEvent } from './types';

/**
 * Compute a cryptographic hash of an audit event
 * 
 * This creates a deterministic hash of the event's immutable fields,
 * which can be used to detect tampering.
 */
export function computeEventHash(event: AuditEvent, previousHash?: string): string {
  const hashInput = {
    eventId: event.eventId,
    tenantId: event.tenantId,
    timestamp: event.timestamp.toISOString(),
    actor: event.actor,
    category: event.category,
    severity: event.severity,
    action: event.action,
    resource: event.resource,
    outcome: event.outcome,
    details: event.details,
    metadata: event.metadata,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    previousHash: previousHash || null,
  };

  const canonical = JSON.stringify(hashInput, Object.keys(hashInput).sort());
  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Verify that an event's hash matches its content
 */
export function verifyEventHash(event: AuditEvent, storedHash: string, previousHash?: string): boolean {
  const computedHash = computeEventHash(event, previousHash);
  return computedHash === storedHash;
}

/**
 * Compute a chain hash for a sequence of events
 * 
 * This creates a blockchain-like chain where each event's hash
 * depends on the previous event's hash, making it impossible to
 * modify or reorder events without detection.
 */
export function computeChainHash(events: AuditEvent[]): string[] {
  const hashes: string[] = [];
  let previousHash: string | undefined;

  for (const event of events) {
    const hash = computeEventHash(event, previousHash);
    hashes.push(hash);
    previousHash = hash;
  }

  return hashes;
}

/**
 * Verify the integrity of an event chain
 */
export function verifyChainIntegrity(
  events: AuditEvent[],
  storedHashes: string[]
): { intact: boolean; firstBrokenIndex?: number } {
  if (events.length !== storedHashes.length) {
    return { intact: false, firstBrokenIndex: 0 };
  }

  let previousHash: string | undefined;

  for (let i = 0; i < events.length; i++) {
    const computedHash = computeEventHash(events[i], previousHash);
    if (computedHash !== storedHashes[i]) {
      return { intact: false, firstBrokenIndex: i };
    }
    previousHash = computedHash;
  }

  return { intact: true };
}
