/**
 * Hash utilities for tamper detection
 */
import { AuditEvent } from './types';
/**
 * Compute a cryptographic hash of an audit event
 *
 * This creates a deterministic hash of the event's immutable fields,
 * which can be used to detect tampering.
 */
export declare function computeEventHash(event: AuditEvent, previousHash?: string): string;
/**
 * Verify that an event's hash matches its content
 */
export declare function verifyEventHash(event: AuditEvent, storedHash: string, previousHash?: string): boolean;
/**
 * Compute a chain hash for a sequence of events
 *
 * This creates a blockchain-like chain where each event's hash
 * depends on the previous event's hash, making it impossible to
 * modify or reorder events without detection.
 */
export declare function computeChainHash(events: AuditEvent[]): string[];
/**
 * Verify the integrity of an event chain
 */
export declare function verifyChainIntegrity(events: AuditEvent[], storedHashes: string[]): {
    intact: boolean;
    firstBrokenIndex?: number;
};
//# sourceMappingURL=hash-utils.d.ts.map