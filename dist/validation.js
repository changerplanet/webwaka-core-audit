"use strict";
/**
 * Input validation schemas using Zod
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryAuditEventsInputSchema = exports.CreateAuditEventInputSchema = exports.ActorSchema = exports.UserIdSchema = exports.TenantIdSchema = void 0;
exports.validate = validate;
const zod_1 = require("zod");
const types_1 = require("./types");
/**
 * Tenant ID validation
 */
exports.TenantIdSchema = zod_1.z.string().min(1).max(255);
/**
 * User ID validation
 */
exports.UserIdSchema = zod_1.z.string().min(1).max(255);
/**
 * Actor validation
 */
exports.ActorSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(types_1.ActorType),
    id: zod_1.z.string().min(1).max(255),
    tenantId: exports.TenantIdSchema.optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Create audit event input validation
 */
exports.CreateAuditEventInputSchema = zod_1.z.object({
    tenantId: exports.TenantIdSchema,
    actor: exports.ActorSchema,
    category: zod_1.z.nativeEnum(types_1.EventCategory),
    severity: zod_1.z.nativeEnum(types_1.EventSeverity),
    action: zod_1.z.string().min(1).max(255),
    resource: zod_1.z.string().max(500).optional(),
    outcome: zod_1.z.enum(['success', 'failure']),
    details: zod_1.z.record(zod_1.z.unknown()).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    ipAddress: zod_1.z.string().max(45).optional(), // IPv6 max length
    userAgent: zod_1.z.string().max(1000).optional(),
});
/**
 * Query audit events input validation
 */
exports.QueryAuditEventsInputSchema = zod_1.z.object({
    tenantId: exports.TenantIdSchema,
    actorId: zod_1.z.string().optional(),
    category: zod_1.z.nativeEnum(types_1.EventCategory).optional(),
    severity: zod_1.z.nativeEnum(types_1.EventSeverity).optional(),
    action: zod_1.z.string().optional(),
    resource: zod_1.z.string().optional(),
    outcome: zod_1.z.enum(['success', 'failure']).optional(),
    startTime: zod_1.z.date().optional(),
    endTime: zod_1.z.date().optional(),
    limit: zod_1.z.number().int().min(1).max(1000).optional(),
    offset: zod_1.z.number().int().min(0).optional(),
});
/**
 * Validate input against a schema
 */
function validate(schema, input) {
    return schema.parse(input);
}
//# sourceMappingURL=validation.js.map