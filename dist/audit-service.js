"use strict";
/**
 * Core Audit Service
 *
 * Provides centralized, immutable audit logging with tamper detection
 * and actor attribution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const crypto_1 = require("crypto");
const validation_1 = require("./validation");
const hash_utils_1 = require("./hash-utils");
/**
 * Audit Service
 */
class AuditService {
    constructor(config) {
        this.storage = config.storage;
    }
    /**
     * Log an audit event (append-only, immutable)
     */
    async logEvent(input) {
        const validated = (0, validation_1.validate)(validation_1.CreateAuditEventInputSchema, input);
        // Generate event ID
        const eventId = this.generateId();
        const event = {
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
        const hash = (0, hash_utils_1.computeEventHash)(event, previousHash || undefined);
        // Store event with hash
        return this.storage.appendEvent(event, hash);
    }
    /**
     * Get an audit event by ID
     */
    async getEvent(tenantId, eventId) {
        (0, validation_1.validate)(validation_1.TenantIdSchema, tenantId);
        const record = await this.storage.getEvent(tenantId, eventId);
        return record ? record.event : null;
    }
    /**
     * Query audit events with filters
     */
    async queryEvents(input) {
        const validated = (0, validation_1.validate)(validation_1.QueryAuditEventsInputSchema, input);
        return this.storage.queryEvents(validated);
    }
    /**
     * Verify the integrity of the audit log for a tenant
     *
     * This checks that the event chain has not been tampered with by
     * verifying the cryptographic hash chain.
     */
    async verifyIntegrity(tenantId) {
        (0, validation_1.validate)(validation_1.TenantIdSchema, tenantId);
        const records = await this.storage.getAllEvents(tenantId);
        if (records.length === 0) {
            return { intact: true };
        }
        const events = records.map(r => r.event);
        const storedHashes = records.map(r => r.hash);
        const result = (0, hash_utils_1.verifyChainIntegrity)(events, storedHashes);
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
    async proveEvent(tenantId, eventId) {
        (0, validation_1.validate)(validation_1.TenantIdSchema, tenantId);
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
    generateId() {
        return (0, crypto_1.randomBytes)(16).toString('hex');
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit-service.js.map