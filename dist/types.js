"use strict";
/**
 * Core type definitions for the Audit service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSeverity = exports.EventCategory = exports.ActorType = void 0;
/**
 * Actor type in an audit event
 */
var ActorType;
(function (ActorType) {
    ActorType["USER"] = "user";
    ActorType["SYSTEM"] = "system";
    ActorType["SERVICE"] = "service";
})(ActorType || (exports.ActorType = ActorType = {}));
/**
 * Event category
 */
var EventCategory;
(function (EventCategory) {
    EventCategory["SECURITY"] = "security";
    EventCategory["FINANCIAL"] = "financial";
    EventCategory["ADMINISTRATIVE"] = "administrative";
    EventCategory["DATA"] = "data";
    EventCategory["SYSTEM"] = "system";
})(EventCategory || (exports.EventCategory = EventCategory = {}));
/**
 * Event severity
 */
var EventSeverity;
(function (EventSeverity) {
    EventSeverity["INFO"] = "info";
    EventSeverity["WARNING"] = "warning";
    EventSeverity["ERROR"] = "error";
    EventSeverity["CRITICAL"] = "critical";
})(EventSeverity || (exports.EventSeverity = EventSeverity = {}));
//# sourceMappingURL=types.js.map