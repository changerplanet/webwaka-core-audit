/**
 * Input validation schemas using Zod
 */

import { z } from 'zod';
import { ActorType, EventCategory, EventSeverity } from './types';

/**
 * Tenant ID validation
 */
export const TenantIdSchema = z.string().min(1).max(255);

/**
 * User ID validation
 */
export const UserIdSchema = z.string().min(1).max(255);

/**
 * Actor validation
 */
export const ActorSchema = z.object({
  type: z.nativeEnum(ActorType),
  id: z.string().min(1).max(255),
  tenantId: TenantIdSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Create audit event input validation
 */
export const CreateAuditEventInputSchema = z.object({
  tenantId: TenantIdSchema,
  actor: ActorSchema,
  category: z.nativeEnum(EventCategory),
  severity: z.nativeEnum(EventSeverity),
  action: z.string().min(1).max(255),
  resource: z.string().max(500).optional(),
  outcome: z.enum(['success', 'failure']),
  details: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().max(45).optional(), // IPv6 max length
  userAgent: z.string().max(1000).optional(),
});

/**
 * Query audit events input validation
 */
export const QueryAuditEventsInputSchema = z.object({
  tenantId: TenantIdSchema,
  actorId: z.string().optional(),
  category: z.nativeEnum(EventCategory).optional(),
  severity: z.nativeEnum(EventSeverity).optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  outcome: z.enum(['success', 'failure']).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
});

/**
 * Validate input against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, input: unknown): T {
  return schema.parse(input);
}
