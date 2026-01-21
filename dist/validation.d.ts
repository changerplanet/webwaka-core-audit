/**
 * Input validation schemas using Zod
 */
import { z } from 'zod';
import { ActorType, EventCategory, EventSeverity } from './types';
/**
 * Tenant ID validation
 */
export declare const TenantIdSchema: z.ZodString;
/**
 * User ID validation
 */
export declare const UserIdSchema: z.ZodString;
/**
 * Actor validation
 */
export declare const ActorSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof ActorType>;
    id: z.ZodString;
    tenantId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: ActorType;
    id: string;
    tenantId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    type: ActorType;
    id: string;
    tenantId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
/**
 * Create audit event input validation
 */
export declare const CreateAuditEventInputSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actor: z.ZodObject<{
        type: z.ZodNativeEnum<typeof ActorType>;
        id: z.ZodString;
        tenantId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        type: ActorType;
        id: string;
        tenantId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        type: ActorType;
        id: string;
        tenantId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>;
    category: z.ZodNativeEnum<typeof EventCategory>;
    severity: z.ZodNativeEnum<typeof EventSeverity>;
    action: z.ZodString;
    resource: z.ZodOptional<z.ZodString>;
    outcome: z.ZodEnum<["success", "failure"]>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    actor: {
        type: ActorType;
        id: string;
        tenantId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    };
    category: EventCategory;
    severity: EventSeverity;
    action: string;
    outcome: "success" | "failure";
    metadata?: Record<string, unknown> | undefined;
    resource?: string | undefined;
    details?: Record<string, unknown> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    tenantId: string;
    actor: {
        type: ActorType;
        id: string;
        tenantId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    };
    category: EventCategory;
    severity: EventSeverity;
    action: string;
    outcome: "success" | "failure";
    metadata?: Record<string, unknown> | undefined;
    resource?: string | undefined;
    details?: Record<string, unknown> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
/**
 * Query audit events input validation
 */
export declare const QueryAuditEventsInputSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNativeEnum<typeof EventCategory>>;
    severity: z.ZodOptional<z.ZodNativeEnum<typeof EventSeverity>>;
    action: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    outcome: z.ZodOptional<z.ZodEnum<["success", "failure"]>>;
    startTime: z.ZodOptional<z.ZodDate>;
    endTime: z.ZodOptional<z.ZodDate>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    category?: EventCategory | undefined;
    severity?: EventSeverity | undefined;
    action?: string | undefined;
    resource?: string | undefined;
    outcome?: "success" | "failure" | undefined;
    actorId?: string | undefined;
    startTime?: Date | undefined;
    endTime?: Date | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    tenantId: string;
    category?: EventCategory | undefined;
    severity?: EventSeverity | undefined;
    action?: string | undefined;
    resource?: string | undefined;
    outcome?: "success" | "failure" | undefined;
    actorId?: string | undefined;
    startTime?: Date | undefined;
    endTime?: Date | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
/**
 * Validate input against a schema
 */
export declare function validate<T>(schema: z.ZodSchema<T>, input: unknown): T;
//# sourceMappingURL=validation.d.ts.map