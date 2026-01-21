"use strict";
/**
 * Storage interface for audit data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAuditStorage = void 0;
/**
 * In-memory implementation for testing
 */
class InMemoryAuditStorage {
    constructor() {
        this.events = new Map();
        this.eventsByTenant = new Map();
    }
    getKey(tenantId, eventId) {
        return `${tenantId}:${eventId}`;
    }
    async appendEvent(event, hash) {
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
        this.eventsByTenant.get(event.tenantId).push(record);
        return event;
    }
    async getEvent(tenantId, eventId) {
        const key = this.getKey(tenantId, eventId);
        return this.events.get(key) || null;
    }
    async queryEvents(input) {
        const tenantEvents = this.eventsByTenant.get(input.tenantId) || [];
        // Apply filters
        const filtered = tenantEvents.filter(record => {
            const event = record.event;
            if (input.actorId && event.actor.id !== input.actorId)
                return false;
            if (input.category && event.category !== input.category)
                return false;
            if (input.severity && event.severity !== input.severity)
                return false;
            if (input.action && event.action !== input.action)
                return false;
            if (input.resource && event.resource !== input.resource)
                return false;
            if (input.outcome && event.outcome !== input.outcome)
                return false;
            if (input.startTime && event.timestamp < input.startTime)
                return false;
            if (input.endTime && event.timestamp > input.endTime)
                return false;
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
    async getAllEvents(tenantId) {
        const tenantEvents = this.eventsByTenant.get(tenantId) || [];
        // Return in chronological order (oldest first)
        return [...tenantEvents].sort((a, b) => a.event.timestamp.getTime() - b.event.timestamp.getTime());
    }
    async getPreviousEventHash(tenantId) {
        const tenantEvents = this.eventsByTenant.get(tenantId) || [];
        if (tenantEvents.length === 0) {
            return null;
        }
        return tenantEvents[tenantEvents.length - 1].hash;
    }
}
exports.InMemoryAuditStorage = InMemoryAuditStorage;
//# sourceMappingURL=storage.js.map