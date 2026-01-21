"use strict";
/**
 * WebWaka Core Audit Service
 *
 * Provides centralized, immutable audit logging with tamper detection
 * and actor attribution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryAuditEventsInputSchema = exports.CreateAuditEventInputSchema = exports.ActorSchema = exports.UserIdSchema = exports.TenantIdSchema = exports.validate = exports.verifyChainIntegrity = exports.computeChainHash = exports.verifyEventHash = exports.computeEventHash = exports.InMemoryAuditStorage = exports.EventSeverity = exports.EventCategory = exports.ActorType = exports.AuditService = void 0;
// Main service
var audit_service_1 = require("./audit-service");
Object.defineProperty(exports, "AuditService", { enumerable: true, get: function () { return audit_service_1.AuditService; } });
// Types
var types_1 = require("./types");
Object.defineProperty(exports, "ActorType", { enumerable: true, get: function () { return types_1.ActorType; } });
Object.defineProperty(exports, "EventCategory", { enumerable: true, get: function () { return types_1.EventCategory; } });
Object.defineProperty(exports, "EventSeverity", { enumerable: true, get: function () { return types_1.EventSeverity; } });
// Storage interfaces
var storage_1 = require("./storage");
Object.defineProperty(exports, "InMemoryAuditStorage", { enumerable: true, get: function () { return storage_1.InMemoryAuditStorage; } });
// Hash utilities
var hash_utils_1 = require("./hash-utils");
Object.defineProperty(exports, "computeEventHash", { enumerable: true, get: function () { return hash_utils_1.computeEventHash; } });
Object.defineProperty(exports, "verifyEventHash", { enumerable: true, get: function () { return hash_utils_1.verifyEventHash; } });
Object.defineProperty(exports, "computeChainHash", { enumerable: true, get: function () { return hash_utils_1.computeChainHash; } });
Object.defineProperty(exports, "verifyChainIntegrity", { enumerable: true, get: function () { return hash_utils_1.verifyChainIntegrity; } });
// Validation
var validation_1 = require("./validation");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validation_1.validate; } });
Object.defineProperty(exports, "TenantIdSchema", { enumerable: true, get: function () { return validation_1.TenantIdSchema; } });
Object.defineProperty(exports, "UserIdSchema", { enumerable: true, get: function () { return validation_1.UserIdSchema; } });
Object.defineProperty(exports, "ActorSchema", { enumerable: true, get: function () { return validation_1.ActorSchema; } });
Object.defineProperty(exports, "CreateAuditEventInputSchema", { enumerable: true, get: function () { return validation_1.CreateAuditEventInputSchema; } });
Object.defineProperty(exports, "QueryAuditEventsInputSchema", { enumerable: true, get: function () { return validation_1.QueryAuditEventsInputSchema; } });
//# sourceMappingURL=index.js.map