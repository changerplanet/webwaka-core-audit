"use strict";
/**
 * Hash utilities for tamper detection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEventHash = computeEventHash;
exports.verifyEventHash = verifyEventHash;
exports.computeChainHash = computeChainHash;
exports.verifyChainIntegrity = verifyChainIntegrity;
const crypto_1 = require("crypto");
/**
 * Compute a cryptographic hash of an audit event
 *
 * This creates a deterministic hash of the event's immutable fields,
 * which can be used to detect tampering.
 */
function computeEventHash(event, previousHash) {
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
    return (0, crypto_1.createHash)('sha256').update(canonical).digest('hex');
}
/**
 * Verify that an event's hash matches its content
 */
function verifyEventHash(event, storedHash, previousHash) {
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
function computeChainHash(events) {
    const hashes = [];
    let previousHash;
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
function verifyChainIntegrity(events, storedHashes) {
    if (events.length !== storedHashes.length) {
        return { intact: false, firstBrokenIndex: 0 };
    }
    let previousHash;
    for (let i = 0; i < events.length; i++) {
        const computedHash = computeEventHash(events[i], previousHash);
        if (computedHash !== storedHashes[i]) {
            return { intact: false, firstBrokenIndex: i };
        }
        previousHash = computedHash;
    }
    return { intact: true };
}
//# sourceMappingURL=hash-utils.js.map